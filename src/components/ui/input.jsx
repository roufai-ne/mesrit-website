// src/components/ui/input.jsx
import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { AlertCircle, Eye, EyeOff, Check } from 'lucide-react';
import { useAccessibleIds } from '@/lib/accessibility';

const inputVariants = {
  size: {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  },
  variant: {
    default: 'glass-effect border-white/20 focus:border-primary-500 focus:ring-primary-500/20',
    error: 'glass-effect border-error-500/50 focus:border-error-500 focus:ring-error-500/20',
    success: 'glass-effect border-success-500/50 focus:border-success-500 focus:ring-success-500/20',
    warning: 'glass-effect border-warning-500/50 focus:border-warning-500 focus:ring-warning-500/20',
  },
};

const Input = React.forwardRef(({
  className,
  type = 'text',
  size = 'md',
  variant = 'default',
  label,
  description,
  error,
  success,
  warning,
  required = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  id,
  name,
  autoComplete,
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasBeenFocused, setHasBeenFocused] = useState(false);
  const inputRef = useRef(null);
  const ids = useAccessibleIds('input');
  
  // Merge refs
  React.useImperativeHandle(ref, () => inputRef.current);
  
  // Determine current variant based on validation state
  const currentVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
  
  // Generate IDs for accessibility
  const inputId = id || ids.input;
  const labelId = `${inputId}-label`;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const successId = success ? `${inputId}-success` : undefined;
  const warningId = warning ? `${inputId}-warning` : undefined;
  
  // Combine aria-describedby
  const describedBy = [
    ariaDescribedby,
    descriptionId,
    errorId,
    successId,
    warningId
  ].filter(Boolean).join(' ') || undefined;
  
  // Handle focus events
  const handleFocus = (e) => {
    setIsFocused(true);
    setHasBeenFocused(true);
    onFocus?.(e);
  };
  
  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    // Keep focus on input after toggling
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Determine input type
  const inputType = type === 'password' && showPasswordToggle 
    ? (showPassword ? 'text' : 'password') 
    : type;
    
  // Validation icon
  const ValidationIcon = error ? AlertCircle : success ? Check : null;
  
  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label 
          id={labelId}
          htmlFor={inputId}
          className={clsx(
            'block text-sm font-medium mb-2 transition-colors',
            disabled ? 'text-secondary-400' : 'text-secondary-700',
            required && "after:content-['*'] after:ml-1 after:text-error-500"
          )}
        >
          {label}
        </label>
      )}
      
      {/* Description */}
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-secondary-600 mb-2"
        >
          {description}
        </p>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
            {leftIcon}
          </div>
        )}
        
        {/* Input */}
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled || loading}
          required={required}
          autoComplete={autoComplete}
          aria-label={ariaLabel}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          aria-required={required}
          className={clsx(
            // Base styles
            'w-full rounded-lg border transition-all duration-200 ease-in-out',
            'focus:outline-none focus:ring-3 disabled:opacity-50 disabled:cursor-not-allowed',
            'placeholder-secondary-400',
            
            // Size variants
            inputVariants.size[size],
            
            // Color variants
            inputVariants.variant[currentVariant],
            
            // Icon padding
            leftIcon && 'pl-10',
            (rightIcon || ValidationIcon || (type === 'password' && showPasswordToggle)) && 'pr-10',
            
            // Focus styles
            isFocused && 'ring-3',
            
            // Loading state
            loading && 'cursor-wait',
            
            className
          )}
          {...props}
        />
        
        {/* Right Icons Container */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {/* Loading Spinner */}
          {loading && (
            <div 
              className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"
              aria-hidden="true"
            />
          )}
          
          {/* Validation Icon */}
          {!loading && ValidationIcon && (
            <ValidationIcon 
              className={clsx(
                'w-4 h-4',
                error && 'text-error-500',
                success && 'text-success-500'
              )}
              aria-hidden="true"
            />
          )}
          
          {/* Password Toggle */}
          {!loading && !ValidationIcon && type === 'password' && showPasswordToggle && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-secondary-400 hover:text-secondary-600 focus:outline-none focus:text-secondary-600"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          )}
          
          {/* Right Icon */}
          {!loading && !ValidationIcon && !(type === 'password' && showPasswordToggle) && rightIcon && (
            <span className="text-secondary-400" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <p 
          id={errorId}
          className="mt-2 text-sm text-error-600 flex items-start space-x-1"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      
      {/* Success Message */}
      {success && !error && (
        <p 
          id={successId}
          className="mt-2 text-sm text-success-600 flex items-start space-x-1"
          role="status"
          aria-live="polite"
        >
          <Check className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{success}</span>
        </p>
      )}
      
      {/* Warning Message */}
      {warning && !error && !success && (
        <p 
          id={warningId}
          className="mt-2 text-sm text-warning-600 flex items-start space-x-1"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{warning}</span>
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input, inputVariants };