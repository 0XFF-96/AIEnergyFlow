import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Shield, MapPin, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export type UserRole = 'community' | 'operator';
export type MicrogridLocation = 'north-perth' | 'south-bunbury' | 'east-kalgoorlie' | 'west-geraldton';

interface SystemInitializationProps {
  onInitialize: (role: UserRole, location: MicrogridLocation) => void;
  isInitializing?: boolean;
}

interface RoleCardProps {
  role: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, title, description, icon, isSelected, onSelect }) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover-elevate border-2",
        isSelected 
          ? "border-primary bg-primary/5 shadow-lg" 
          : "border-border hover:border-primary/50"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-6 text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
        {isSelected && (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            Selected
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

const microgridLocations = [
  { value: 'north-perth', label: 'Microgrid North (Perth)', region: 'Northern Region' },
  { value: 'south-bunbury', label: 'Microgrid South (Bunbury)', region: 'Southern Region' },
  { value: 'east-kalgoorlie', label: 'Microgrid East (Kalgoorlie)', region: 'Eastern Region' },
  { value: 'west-geraldton', label: 'Microgrid West (Geraldton)', region: 'Western Region' },
];

export default function SystemInitialization({ onInitialize, isInitializing = false }: SystemInitializationProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MicrogridLocation | null>(null);

  const handleInitialize = () => {
    if (selectedRole && selectedLocation) {
      onInitialize(selectedRole, selectedLocation);
    }
  };

  const isReady = selectedRole && selectedLocation;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">AI Energy Management System</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Please select your operational role and the microgrid location to launch your personalized energy monitoring dashboard.
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Select Your Role</h2>
            <p className="text-sm text-muted-foreground">Choose the interface that best matches your responsibilities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RoleCard
              role="community"
              title="Community Member"
              description="Simplified high-level status and community energy insights"
              icon={<Users className="h-8 w-8 text-green-500" />}
              isSelected={selectedRole === 'community'}
              onSelect={() => setSelectedRole('community')}
            />
            
            <RoleCard
              role="operator"
              title="System Operator"
              description="Full technical control, detailed analytics, and system management"
              icon={<Shield className="h-8 w-8 text-blue-500" />}
              isSelected={selectedRole === 'operator'}
              onSelect={() => setSelectedRole('operator')}
            />
          </div>
        </div>

        {/* Location Selection */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Choose Microgrid Location</h2>
            <p className="text-sm text-muted-foreground">Select the microgrid system you'll be monitoring</p>
          </div>
          
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Western Australia Microgrids</span>
                </div>
                
                <Select 
                  value={selectedLocation || undefined} 
                  onValueChange={(value: MicrogridLocation) => setSelectedLocation(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="--- Select a Location ---" />
                  </SelectTrigger>
                  <SelectContent>
                    {microgridLocations.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{location.label}</span>
                          <span className="text-xs text-muted-foreground">{location.region}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Launch Button */}
        <div className="text-center">
          <Button
            onClick={handleInitialize}
            disabled={!isReady || isInitializing}
            size="lg"
            className="w-full max-w-md h-12 text-base font-medium"
          >
            {isInitializing ? (
              <>
                <Zap className="h-5 w-5 mr-2 animate-pulse" />
                Launching Dashboard...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Launch Dashboard
              </>
            )}
          </Button>
          
          {!isReady && (
            <p className="text-xs text-muted-foreground mt-2">
              Please select both your role and microgrid location to continue
            </p>
          )}
        </div>

        {/* Selection Summary */}
        {(selectedRole || selectedLocation) && (
          <Card className="w-full max-w-md mx-auto bg-muted/20">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2">Selection Summary</h4>
              <div className="space-y-1 text-xs">
                {selectedRole && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedRole === 'community' ? 'Community Member' : 'System Operator'}
                    </Badge>
                  </div>
                )}
                {selectedLocation && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <Badge variant="outline" className="text-xs">
                      {microgridLocations.find(l => l.value === selectedLocation)?.label}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
