'use client';

import Card from '@/components/Card';
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
    <Card>
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${color}`} />
        {connected && (
          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
            Connected
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">{name}</h3>
      <Button
        variant={connected ? 'secondary' : 'primary'}
        size="sm"
        className="w-full"
        onClick={onConnect}
      >
        {connected ? 'Manage' : 'Connect'}
      </Button>
    </Card>
  );
}
