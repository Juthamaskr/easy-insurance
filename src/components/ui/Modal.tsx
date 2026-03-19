'use client';

import { Fragment, type ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className={cn(
            'bg-white w-full shadow-xl',
            // Mobile: slide up from bottom, rounded top
            'rounded-t-2xl sm:rounded-xl',
            // Responsive max width
            'sm:max-w-md md:max-w-lg',
            size === 'lg' && 'sm:max-w-2xl md:max-w-3xl',
            size === 'xl' && 'sm:max-w-3xl md:max-w-5xl lg:max-w-6xl',
            size === 'full' && 'sm:max-w-full sm:mx-4',
            // Height
            'max-h-[85vh] sm:max-h-[90vh]',
            'overflow-hidden',
            // Animation
            'animate-slide-up sm:animate-none'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag indicator for mobile */}
          <div className="flex justify-center pt-2 pb-1 sm:hidden">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={22} />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="px-4 sm:px-6 py-4 overflow-y-auto max-h-[calc(85vh-100px)] sm:max-h-[calc(90vh-120px)]">
            {children}
          </div>
        </div>
      </div>
    </Fragment>
  );
}
