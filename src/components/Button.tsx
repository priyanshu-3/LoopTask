import React, { useCallback, useRef, useEffect } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  onClick,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group active:scale-95';
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    outline: 'border-2 border-gray-600 hover:border-blue-500 text-gray-300 hover:text-blue-400 hover:bg-blue-500/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Optimized click handler with immediate visual feedback
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent double clicks within 200ms
    if (clickTimeoutRef.current) {
      return;
    }
    
    // Call original onClick immediately (don't delay)
    if (onClick) {
      onClick(e);
    }
    
    // Set timeout to prevent rapid double clicks
    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null;
    }, 200);
  }, [onClick]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={handleClick}
      style={{ willChange: 'transform' }}
      {...props}
    >
      {/* Shine effect on hover - optimized with will-change */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" style={{ willChange: 'transform' }}></span>
      <span className="relative z-10 flex items-center justify-center">{children}</span>
    </button>
  );
}
