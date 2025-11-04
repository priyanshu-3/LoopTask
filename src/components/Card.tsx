import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-gray-800 border border-gray-700 rounded-lg p-6 ${
        hover ? 'hover:border-blue-500 transition-colors duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
