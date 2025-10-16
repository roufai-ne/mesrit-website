// src/components/ui/modal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { useFocusTrap, useAccessibleIds, useReducedMotion } from '@/lib/accessibility';
import { Button } from './button';

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

const Modal = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  title,
  description,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscapeKey = true,
  initialFocus,
  restoreFocus = true,
  className,
  overlayClassName,
  preventScroll = true,
  role = 'dialog',
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  ...props
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const previousActiveElement = useRef(null);
  const modalRef = useFocusTrap(isOpen);
  const ids = useAccessibleIds('modal');
  const prefersReducedMotion = useReducedMotion();
  
  // Store the previously focused element
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
    }
  }, [isOpen]);
  
  // Handle mount/unmount
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Handle body scroll lock
  useEffect(() => {
    if (!isOpen || !preventScroll) return;
    
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, preventScroll]);
  
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscapeKey) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscapeKey, onClose]);
  
  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen && restoreFocus && previousActiveElement.current) {
      // Small delay to allow for smooth transition
      setTimeout(() => {
        previousActiveElement.current?.focus();
      }, 100);
    }
  }, [isOpen, restoreFocus]);
  
  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Don't render on server or when not mounted
  if (!isMounted || !isOpen) return null;
  
  const modalContent = (
    <div
      className={clsx(
        'glass-modal fixed inset-0 z-50 flex items-center justify-center',
        overlayClassName
      )}
      onClick={handleOverlayClick}
    >
      {/* Backdrop */}
      <div 
        className={clsx(
          'absolute inset-0 bg-black/30 backdrop-blur-md',
          !prefersReducedMotion && 'transition-opacity duration-300'
        )}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        role={role}
        aria-modal="true"
        aria-labelledby={title ? ids.title : ariaLabelledby}
        aria-describedby={description ? ids.description : ariaDescribedby}
        tabIndex={-1}
        className={clsx(
          'relative glass-modal-content w-full mx-4',
          'focus:outline-none',
          !prefersReducedMotion && 'transition-all duration-300 ease-out',
          modalSizes[size],
          className
        )}
        style={{
          transform: prefersReducedMotion ? 'none' : undefined,
        }}
        {...props}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className={clsx(
              'absolute top-4 right-4 z-10',
              'p-2 rounded-lg text-secondary-400 hover:text-secondary-600',
              'hover:bg-secondary-100 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/20'
            )}
            aria-label="Fermer la boîte de dialogue"
            data-close
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
        
        {children}
      </div>
    </div>
  );
  
  // Render in portal
  return createPortal(modalContent, document.body);
};

const ModalHeader = ({ 
  children, 
  className,
  showDivider = true,
  ...props 
}) => {
  const ids = useAccessibleIds('modal-header');
  
  return (
    <div 
      className={clsx(
        'px-6 py-4',
        showDivider && 'border-b border-secondary-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const ModalTitle = ({ 
  children, 
  className,
  as: Component = 'h2',
  id,
  ...props 
}) => {
  const ids = useAccessibleIds('modal-title');
  const titleId = id || ids.title;
  
  return (
    <Component
      id={titleId}
      className={clsx(
        'text-xl font-semibold text-secondary-900 pr-8',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

const ModalDescription = ({ 
  children, 
  className,
  id,
  ...props 
}) => {
  const ids = useAccessibleIds('modal-description');
  const descriptionId = id || ids.description;
  
  return (
    <p
      id={descriptionId}
      className={clsx(
        'mt-2 text-sm text-secondary-600',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

const ModalBody = ({ 
  children, 
  className,
  ...props 
}) => {
  return (
    <div 
      className={clsx(
        'px-6 py-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const ModalFooter = ({ 
  children, 
  className,
  showDivider = true,
  align = 'right',
  ...props 
}) => {
  return (
    <div 
      className={clsx(
        'px-6 py-4 flex gap-3',
        showDivider && 'border-t border-secondary-200',
        {
          'justify-start': align === 'left',
          'justify-center': align === 'center',
          'justify-end': align === 'right',
          'justify-between': align === 'between',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Compound components for common modal patterns
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmer l\'action',
  description,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'error',
  loading = false,
  ...props
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Let parent handle error
      console.error('Confirmation error:', error);
    }
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="sm"
      {...props}
    >
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        {description && <ModalDescription>{description}</ModalDescription>}
      </ModalHeader>
      
      <ModalFooter>
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={handleConfirm}
          loading={loading}
          autoFocus
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const AlertModal = ({
  isOpen,
  onClose,
  title = 'Information',
  description,
  buttonText = 'OK',
  variant = 'primary',
  ...props
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="sm"
      {...props}
    >
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        {description && <ModalDescription>{description}</ModalDescription>}
      </ModalHeader>
      
      <ModalFooter>
        <Button
          variant={variant}
          onClick={onClose}
          autoFocus
        >
          {buttonText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ConfirmModal,
  AlertModal,
  modalSizes
};