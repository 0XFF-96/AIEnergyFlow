import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import AIInsights from './AIInsights';

interface FloatingAIButtonProps {
  alerts?: any[];
  onRefresh?: () => void;
}

export function FloatingAIButton({ alerts = [], onRefresh }: FloatingAIButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating AI Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40",
          "w-14 h-14 rounded-full",
          "bg-green-500 hover:bg-green-600",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-300",
          "flex items-center justify-center",
          "border-2 border-green-400/30",
          "hover:scale-110 hover:rotate-3"
        )}
        size="icon"
      >
        <Brain className="h-7 w-7 text-white" />
        
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-green-400/30 animate-ping" />
        
        {/* Notification badge if there are alerts */}
        {alerts.length > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">{alerts.length}</span>
          </div>
        )}
      </Button>

      {/* AI Insights Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="bg-background rounded-lg shadow-2xl border border-border/40">
              <div className="flex items-center justify-between p-6 border-b border-border/40">
                <h2 className="text-xl font-semibold flex items-center space-x-3">
                  <Brain className="h-6 w-6 text-green-400" />
                  <span>AI Insights</span>
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <AIInsights 
                  alerts={alerts} 
                  onRefresh={onRefresh}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
