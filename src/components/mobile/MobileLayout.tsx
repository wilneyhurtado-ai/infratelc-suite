import React from 'react';
import { useMobile } from '@/hooks/use-mobile';
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, title }) => {
  const { isNative, networkStatus } = useMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{title}</h1>
          <div className="flex items-center gap-2">
            {isNative && (
              <Badge variant={networkStatus === 'online' ? 'default' : 'destructive'}>
                {networkStatus === 'online' ? (
                  <Wifi className="w-3 h-3 mr-1" />
                ) : (
                  <WifiOff className="w-3 h-3 mr-1" />
                )}
                {networkStatus}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        {children}
      </div>
    </div>
  );
};