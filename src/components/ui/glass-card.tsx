"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  description?: string;
  content?: {
    strong?: string;
    p?: string;
    spans?: string[];
  };
}

export default function GlassCard({ 
  children,
  className = '',
  title,
  icon,
  description,
  content
}: GlassCardProps) {
  return (
    <div className={cn('glass-card-container', className)}>
      <div className="glass-card-box">
        {title && <span className="glass-card-title">{title}</span>}
        {icon && <div className="mb-4">{icon}</div>}
        <div>
          {content?.strong && <strong>{content.strong}</strong>}
          {content?.p && <p>{content.p}</p>}
          {content?.spans && content.spans.map((span, idx) => (
            <span key={idx}>{span}</span>
          ))}
          {children}
        </div>
        {description && <p className="text-sm mt-2">{description}</p>}
      </div>
    </div>
  );
}

