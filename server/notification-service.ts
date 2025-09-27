import { type AlertSystem, type AlertSeverity } from "@shared/alert-schema";
import { WebSocket } from 'ws';

export interface NotificationChannel {
  type: 'dashboard' | 'email' | 'sms' | 'push' | 'websocket';
  config: Record<string, any>;
  enabled: boolean;
}

export interface NotificationRecipient {
  userId: string;
  email?: string;
  phone?: string;
  preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    dashboard: boolean;
  };
}

export class NotificationService {
  private channels: Map<string, NotificationChannel> = new Map();
  private websocketConnections: Map<string, WebSocket> = new Map();
  private recipients: Map<string, NotificationRecipient> = new Map();
  
  constructor() {
    this.initializeDefaultChannels();
    this.initializeDefaultRecipients();
  }
  
  /**
   * Send alert notification through appropriate channels
   */
  async sendAlertNotification(alert: AlertSystem, channels: string[] = ['dashboard', 'websocket']): Promise<void> {
    const severity = alert.severity as AlertSeverity;
    
    // Determine notification channels based on severity
    const notificationChannels = this.determineNotificationChannels(severity, channels);
    
    // Send notifications through each channel
    const promises = notificationChannels.map(channel => 
      this.sendToChannel(alert, channel)
    );
    
    await Promise.allSettled(promises);
  }
  
  /**
   * Determine notification channels based on alert severity
   */
  private determineNotificationChannels(severity: AlertSeverity, requestedChannels: string[]): string[] {
    const channels: string[] = [];
    
    // Always include dashboard and websocket for real-time updates
    if (requestedChannels.includes('dashboard')) channels.push('dashboard');
    if (requestedChannels.includes('websocket')) channels.push('websocket');
    
    // Add additional channels based on severity
    switch (severity) {
      case 'critical':
        channels.push('email', 'sms', 'push');
        break;
      case 'warning':
        channels.push('email', 'push');
        break;
      case 'info':
        channels.push('push');
        break;
    }
    
    return channels;
  }
  
  /**
   * Send notification to specific channel
   */
  private async sendToChannel(alert: AlertSystem, channel: string): Promise<void> {
    try {
      switch (channel) {
        case 'dashboard':
          await this.sendDashboardNotification(alert);
          break;
        case 'email':
          await this.sendEmailNotification(alert);
          break;
        case 'sms':
          await this.sendSMSNotification(alert);
          break;
        case 'push':
          await this.sendPushNotification(alert);
          break;
        case 'websocket':
          await this.sendWebSocketNotification(alert);
          break;
        default:
          console.warn(`Unknown notification channel: ${channel}`);
      }
    } catch (error) {
      console.error(`Failed to send notification via ${channel}:`, error);
    }
  }
  
  /**
   * Dashboard notification (in-app alerts)
   */
  private async sendDashboardNotification(alert: AlertSystem): Promise<void> {
    // Dashboard notifications are handled by the frontend
    // This method logs the notification for tracking
    console.log(`Dashboard notification: ${alert.title} (${alert.severity})`);
    
    // Store notification record in database
    await this.recordNotification(alert.id, 'dashboard', 'sent', new Date());
  }
  
  /**
   * Email notification
   */
  private async sendEmailNotification(alert: AlertSystem): Promise<void> {
    const recipients = this.getEmailRecipients(alert.severity as AlertSeverity);
    
    for (const recipient of recipients) {
      try {
        const emailTemplate = this.generateEmailTemplate(alert);
        await this.sendEmail(recipient, emailTemplate);
        await this.recordNotification(alert.id, 'email', 'sent', new Date(), recipient);
      } catch (error) {
        await this.recordNotification(alert.id, 'email', 'failed', new Date(), recipient, (error as Error).message);
      }
    }
  }
  
  /**
   * SMS notification for critical alerts
   */
  private async sendSMSNotification(alert: AlertSystem): Promise<void> {
    if (alert.severity !== 'critical') return;
    
    const recipients = this.getSMSRecipients();
    
    for (const recipient of recipients) {
      try {
        const smsMessage = this.generateSMSMessage(alert);
        await this.sendSMS(recipient, smsMessage);
        await this.recordNotification(alert.id, 'sms', 'sent', new Date(), recipient);
      } catch (error) {
        await this.recordNotification(alert.id, 'sms', 'failed', new Date(), recipient, (error as Error).message);
      }
    }
  }
  
  /**
   * Push notification
   */
  private async sendPushNotification(alert: AlertSystem): Promise<void> {
    const recipients = this.getPushRecipients(alert.severity as AlertSeverity);
    
    for (const recipient of recipients) {
      try {
        const pushMessage = this.generatePushMessage(alert);
        await this.sendPush(recipient, pushMessage);
        await this.recordNotification(alert.id, 'push', 'sent', new Date(), recipient);
      } catch (error) {
        await this.recordNotification(alert.id, 'push', 'failed', new Date(), recipient, (error as Error).message);
      }
    }
  }
  
  /**
   * WebSocket real-time notification
   */
  private async sendWebSocketNotification(alert: AlertSystem): Promise<void> {
    const message = {
      type: 'alert',
      data: {
        id: alert.id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        type: alert.type,
        timestamp: alert.timestamp,
        source: alert.source,
        deviceId: alert.deviceId,
        location: alert.location
      },
      timestamp: new Date().toISOString()
    };
    
    // Broadcast to all connected clients
    for (const [userId, ws] of Array.from(this.websocketConnections.entries())) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify(message));
          await this.recordNotification(alert.id, 'websocket', 'sent', new Date(), userId);
        } catch (error) {
          console.error(`Failed to send WebSocket notification to ${userId}:`, error);
        }
      }
    }
  }
  
  /**
   * Add WebSocket connection
   */
  addWebSocketConnection(userId: string, ws: WebSocket): void {
    this.websocketConnections.set(userId, ws);
    
    ws.on('close', () => {
      this.websocketConnections.delete(userId);
    });
  }
  
  /**
   * Remove WebSocket connection
   */
  removeWebSocketConnection(userId: string): void {
    this.websocketConnections.delete(userId);
  }
  
  /**
   * Generate email template
   */
  private generateEmailTemplate(alert: AlertSystem): { subject: string; body: string; html: string } {
    const severityColor = this.getSeverityColor(alert.severity as AlertSeverity);
    const severityIcon = this.getSeverityIcon(alert.severity as AlertSeverity);
    
    return {
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      body: `
Energy Management System Alert

${severityIcon} ${alert.title}

Description: ${alert.description}
Severity: ${alert.severity.toUpperCase()}
Type: ${alert.type}
Location: ${alert.location || 'System-wide'}
Time: ${alert.timestamp.toLocaleString()}

Please check the dashboard for more details and take appropriate action.

---
AI Energy Management System
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${severityColor}; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${severityIcon} ${alert.title}</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <p><strong>Description:</strong> ${alert.description}</p>
            <p><strong>Severity:</strong> <span style="color: ${severityColor}; font-weight: bold;">${alert.severity.toUpperCase()}</span></p>
            <p><strong>Type:</strong> ${alert.type}</p>
            <p><strong>Location:</strong> ${alert.location || 'System-wide'}</p>
            <p><strong>Time:</strong> ${alert.timestamp.toLocaleString()}</p>
            <div style="margin-top: 20px; text-align: center;">
              <a href="${process.env.DASHBOARD_URL || 'http://localhost:5000'}" 
                 style="background: #00E0A1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                View Dashboard
              </a>
            </div>
          </div>
        </div>
      `
    };
  }
  
  /**
   * Generate SMS message
   */
  private generateSMSMessage(alert: AlertSystem): string {
    return `[${alert.severity.toUpperCase()}] ${alert.title}: ${alert.description} - ${alert.location || 'System'}`;
  }
  
  /**
   * Generate push notification message
   */
  private generatePushMessage(alert: AlertSystem): { title: string; body: string; data: any } {
    return {
      title: `Energy Alert: ${alert.title}`,
      body: alert.description,
      data: {
        alertId: alert.id,
        severity: alert.severity,
        type: alert.type,
        timestamp: alert.timestamp.toISOString()
      }
    };
  }
  
  /**
   * Get email recipients based on severity
   */
  private getEmailRecipients(severity: AlertSeverity): string[] {
    const recipients: string[] = [];
    
    for (const [userId, recipient] of Array.from(this.recipients.entries())) {
      if (recipient.email && recipient.preferences.email) {
        if (severity === 'critical' || severity === 'warning') {
          recipients.push(recipient.email);
        }
      }
    }
    
    return recipients;
  }
  
  /**
   * Get SMS recipients (only for critical alerts)
   */
  private getSMSRecipients(): string[] {
    const recipients: string[] = [];
    
    for (const [userId, recipient] of Array.from(this.recipients.entries())) {
      if (recipient.phone && recipient.preferences.sms) {
        recipients.push(recipient.phone);
      }
    }
    
    return recipients;
  }
  
  /**
   * Get push notification recipients
   */
  private getPushRecipients(severity: AlertSeverity): string[] {
    const recipients: string[] = [];
    
    for (const [userId, recipient] of Array.from(this.recipients.entries())) {
      if (recipient.preferences.push) {
        recipients.push(userId);
      }
    }
    
    return recipients;
  }
  
  /**
   * Record notification in database
   */
  private async recordNotification(
    alertId: string, 
    channel: string, 
    status: string, 
    sentAt: Date, 
    recipient?: string, 
    errorMessage?: string
  ): Promise<void> {
    // This would typically save to the database
    console.log(`Notification recorded: ${alertId} via ${channel} to ${recipient || 'all'} - ${status}`);
  }
  
  /**
   * Initialize default notification channels
   */
  private initializeDefaultChannels(): void {
    this.channels.set('dashboard', {
      type: 'dashboard',
      config: {},
      enabled: true
    });
    
    this.channels.set('email', {
      type: 'email',
      config: {
        smtp: {
          host: process.env.SMTP_HOST || 'localhost',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        }
      },
      enabled: true
    });
    
    this.channels.set('sms', {
      type: 'sms',
      config: {
        provider: 'twilio',
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        from: process.env.TWILIO_FROM_NUMBER
      },
      enabled: true
    });
    
    this.channels.set('push', {
      type: 'push',
      config: {
        vapidKeys: {
          publicKey: process.env.VAPID_PUBLIC_KEY,
          privateKey: process.env.VAPID_PRIVATE_KEY
        }
      },
      enabled: true
    });
    
    this.channels.set('websocket', {
      type: 'websocket',
      config: {},
      enabled: true
    });
  }
  
  /**
   * Initialize default recipients
   */
  private initializeDefaultRecipients(): void {
    this.recipients.set('admin', {
      userId: 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@energymgmt.com',
      phone: process.env.ADMIN_PHONE || '+1234567890',
      preferences: {
        email: true,
        sms: true,
        push: true,
        dashboard: true
      }
    });
    
    this.recipients.set('operator', {
      userId: 'operator',
      email: process.env.OPERATOR_EMAIL || 'operator@energymgmt.com',
      phone: process.env.OPERATOR_PHONE || '+1234567891',
      preferences: {
        email: true,
        sms: false,
        push: true,
        dashboard: true
      }
    });
  }
  
  /**
   * Get severity color for UI
   */
  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case 'critical': return '#DC3545';
      case 'warning': return '#FFC107';
      case 'info': return '#00E0A1';
      default: return '#6C757D';
    }
  }
  
  /**
   * Get severity icon
   */
  private getSeverityIcon(severity: AlertSeverity): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📋';
    }
  }
  
  // Placeholder methods for actual implementation
  private async sendEmail(recipient: string, template: any): Promise<void> {
    console.log(`Email sent to ${recipient}: ${template.subject}`);
  }
  
  private async sendSMS(recipient: string, message: string): Promise<void> {
    console.log(`SMS sent to ${recipient}: ${message}`);
  }
  
  private async sendPush(recipient: string, message: any): Promise<void> {
    console.log(`Push notification sent to ${recipient}: ${message.title}`);
  }
}

export const notificationService = new NotificationService();
