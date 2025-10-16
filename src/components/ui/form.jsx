// src/components/ui/form.jsx
import React from 'react';
import { clsx } from 'clsx';

export const FormGroup = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('space-y-2', className)}
      {...props}
    >
      {children}
    </div>
  );
});

FormGroup.displayName = 'FormGroup';

export const FormLabel = React.forwardRef(({ className, children, required, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={clsx(
        'block text-sm font-medium text-readable',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-error-500 ml-1">*</span>}
    </label>
  );
});

FormLabel.displayName = 'FormLabel';

export const FormDescription = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={clsx(
        'text-sm text-readable-muted',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
});

FormDescription.displayName = 'FormDescription';

export const FormMessage = React.forwardRef(({ className, children, variant = 'error', ...props }, ref) => {
  const variantStyles = {
    error: 'text-error-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    info: 'text-info-500',
  };

  return (
    <p
      ref={ref}
      className={clsx(
        'text-sm font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
});

FormMessage.displayName = 'FormMessage';

export const Form = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <form
      ref={ref}
      className={clsx(
        'glass-effect rounded-xl p-6 space-y-6',
        'border border-white/20 shadow-glass',
        className
      )}
      {...props}
    >
      {children}
    </form>
  );
});

Form.displayName = 'Form';

export const FormField = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('space-y-2', className)}
      {...props}
    >
      {children}
    </div>
  );
});

FormField.displayName = 'FormField';

export const FormControl = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'glass-effect rounded-lg px-4 py-2',
        'border border-white/20',
        'focus-within:ring-2 focus-within:ring-primary/20',
        'transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

FormControl.displayName = 'FormControl';

export const FormActions = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        'flex items-center justify-end space-x-4 pt-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

FormActions.displayName = 'FormActions';
