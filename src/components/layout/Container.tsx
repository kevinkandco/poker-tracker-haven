
import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}

const Container: React.FC<ContainerProps> = ({ 
  children, 
  className,
  fullHeight = false
}) => {
  return (
    <div 
      className={cn(
        "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        fullHeight && "min-h-[calc(100vh-4rem)]",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;
