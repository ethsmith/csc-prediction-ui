import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'solid';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white/5 backdrop-blur-sm border border-white/10',
      glass: 'bg-white/10 backdrop-blur-md border border-white/20',
      solid: 'bg-csc-blue border border-csc-accent/30',
    };

    return (
      <div
        ref={ref}
        className={`rounded-xl ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
