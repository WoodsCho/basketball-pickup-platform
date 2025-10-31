import React from 'react';
import { cn, getBadgeColor } from '../utils/helpers';
import type { BadgeLevel } from '../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: BadgeLevel;
  size?: 'sm' | 'md' | 'lg';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, level, size = 'md', children, ...props }, ref) => {
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    };

    const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium';

    if (level) {
      return (
        <div
          ref={ref}
          className={cn(
            baseStyles,
            sizes[size],
            'bg-gradient-to-r text-white',
            getBadgeColor(level),
            className
          )}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          sizes[size],
          'bg-gray-100 text-gray-700',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
