'use client';

import { useEffect, useCallback, useRef } from 'react';

const sizeClasses = {
  sm: 'max-w-md',
  default: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] md:max-w-[90vw]',
};

const iconVariants = {
  info: {
    bg: 'bg-gradient-to-br from-blue-100 to-blue-200',
    icon: 'text-blue-600',
    svg: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  success: {
    bg: 'bg-gradient-to-br from-emerald-100 to-emerald-200',
    icon: 'text-emerald-600',
    svg: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-100 to-amber-200',
    icon: 'text-amber-600',
    svg: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  danger: {
    bg: 'bg-gradient-to-br from-red-100 to-red-200',
    icon: 'text-red-600',
    svg: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'default',
  footer,
  icon,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Handle escape key
  const handleEscape = useCallback(
    (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (e) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement;

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Add escape listener
      document.addEventListener('keydown', handleEscape);

      // Focus the first focusable element inside modal (input, button, etc.)
      setTimeout(() => {
        const focusableElements = modalRef.current?.querySelectorAll(
          'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])'
        );
        if (focusableElements && focusableElements.length > 0) {
          // Skip close button, focus the first form element
          const firstInput = Array.from(focusableElements).find(
            (el) => el.tagName !== 'BUTTON' || el.type === 'submit'
          );
          if (firstInput) {
            firstInput.focus();
          }
        }
      }, 100);
    } else {
      document.body.style.overflow = 'unset';

      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const iconConfig = icon ? iconVariants[icon] : null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-fade-in pointer-events-none"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="fixed inset-0 overflow-y-auto"
        onClick={handleOverlayClick}
      >
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Modal Content */}
          <div
            ref={modalRef}
            className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl transform transition-all animate-scale-in`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4">
              {/* Close Button */}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Title Section */}
              <div className={`${showCloseButton ? 'pr-10' : ''} ${iconConfig ? 'flex items-start gap-4' : ''}`}>
                {iconConfig && (
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${iconConfig.bg} ${iconConfig.icon} flex items-center justify-center`}>
                    {iconConfig.svg}
                  </div>
                )}
                <div className="flex-1">
                  <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Body */}
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <>
                <div className="border-t border-gray-100" />
                <div className="px-6 py-4 bg-gray-50/50 rounded-b-2xl">
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    {footer}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Confirm Modal Component
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) {
  const variantStyles = {
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    warning: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
    success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
    info: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      icon={variant}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2.5 text-sm font-medium text-white rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center gap-2 ${variantStyles[variant]}`}
          >
            {isLoading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {confirmText}
          </button>
        </>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
}

// Alert Modal Component
export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
  buttonText = 'OK',
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      icon={variant}
      footer={
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
        >
          {buttonText}
        </button>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
}
