'use client';

import { LiquidGlassCard } from '@/components/ui/liquid-weather-glass';
import Button from '@/components/Button';
import { Github, MessageSquare, FileText, Calendar } from 'lucide-react';

interface IntegrationCardProps {
  name: string;
  icon: 'github' | 'slack' | 'notion' | 'calendar';
  connected: boolean;
  onConnect: () => void;
}

const icons = {
  github: Github,
  slack: MessageSquare,
  notion: FileText,
  calendar: Calendar,
};

const colors = {
  github: 'text-purple-500',
  slack: 'text-pink-500',
  notion: 'text-blue-500',
  calendar: 'text-green-500',
};

export default function IntegrationCard({
  name,
  icon,
  connected,
  onConnect,
}: IntegrationCardProps) {
  const Icon = icons[icon];
  const color = colors[icon];

  return (
    <LiquidGlassCard 
      shadowIntensity='xs'
      borderRadius='16px'
      glowIntensity='sm'
      className="p-6 bg-white/5"
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${color}`} />
        {connected && (
          <span className="bg-green-500/20 backdrop-blur-sm text-green-300 text-xs px-2 py-1 rounded-full border border-green-500/30">
            Connected
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-white">{name}</h3>
      <Button
        variant={connected ? 'secondary' : 'primary'}
        size="sm"
        className="w-full"
        onClick={onConnect}
      >
        {connected ? 'Manage' : 'Connect'}
      </Button>
    </LiquidGlassCard>
  );
}
