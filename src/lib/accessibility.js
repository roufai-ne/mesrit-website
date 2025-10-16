// src/lib/accessibility.js
import { useEffect, useRef, useState } from 'react';

/**
 * Hook for managing focus trap in modals/dropdowns
 */
export function useFocusTrap(isActive = false) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
      
      if (e.key === 'Escape') {
        const closeButton = container.querySelector('[data-close]');
        closeButton?.click();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for managing keyboard navigation in lists/grids
 */
export function useKeyboardNavigation({
  itemCount,
  currentIndex,
  onIndexChange,
  orientation = 'vertical', // 'vertical', 'horizontal', 'grid'
  columns = 1,
  loop = true,
}) {
  const handleKeyDown = (e) => {
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'grid') {
          newIndex = orientation === 'grid' 
            ? Math.min(currentIndex + columns, itemCount - 1)
            : currentIndex + 1;
          e.preventDefault();
        }
        break;
        
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'grid') {
          newIndex = orientation === 'grid'
            ? Math.max(currentIndex - columns, 0)
            : currentIndex - 1;
          e.preventDefault();
        }
        break;
        
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'grid') {
          newIndex = currentIndex + 1;
          e.preventDefault();
        }
        break;
        
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'grid') {
          newIndex = currentIndex - 1;
          e.preventDefault();
        }
        break;
        
      case 'Home':
        newIndex = 0;
        e.preventDefault();
        break;
        
      case 'End':
        newIndex = itemCount - 1;
        e.preventDefault();
        break;
        
      default:
        return;
    }
    
    // Handle wrapping/looping
    if (loop) {
      if (newIndex >= itemCount) newIndex = 0;
      if (newIndex < 0) newIndex = itemCount - 1;
    } else {
      newIndex = Math.max(0, Math.min(newIndex, itemCount - 1));
    }
    
    if (newIndex !== currentIndex) {
      onIndexChange(newIndex);
    }
  };

  return { handleKeyDown };
}

/**
 * Hook for managing accessible descriptions and announcements
 */
export function useAccessibleAnnouncement() {
  const [announcement, setAnnouncement] = useState('');
  const timeoutRef = useRef(null);

  const announce = (message, priority = 'polite') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setAnnouncement('');
    
    timeoutRef.current = setTimeout(() => {
      setAnnouncement(message);
    }, 100);
  };

  const AnnouncementRegion = ({ priority = 'polite' }) => (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );

  return { announce, AnnouncementRegion };
}

/**
 * Hook for managing reduced motion preferences
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Generate accessible IDs for form elements
 */
export function useAccessibleIds(prefix = 'accessible') {
  const [ids] = useState(() => ({
    input: `${prefix}-input-${Math.random().toString(36).substr(2, 9)}`,
    label: `${prefix}-label-${Math.random().toString(36).substr(2, 9)}`,
    description: `${prefix}-description-${Math.random().toString(36).substr(2, 9)}`,
    error: `${prefix}-error-${Math.random().toString(36).substr(2, 9)}`,
  }));

  return ids;
}

/**
 * Utility functions for screen reader support
 */
export const screenReader = {
  // Format numbers for screen readers
  formatNumber: (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  },
  
  // Format dates for screen readers
  formatDate: (date, options = {}) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }).format(new Date(date));
  },
  
  // Create descriptive text for complex elements
  describeProgress: (current, total) => {
    const percentage = Math.round((current / total) * 100);
    return `Progression: ${current} sur ${total}, ${percentage} pour cent`;
  },
  
  // Create loading announcement
  announceLoading: (isLoading, context = '') => {
    return isLoading ? `Chargement ${context}...` : `${context} chargé`;
  }
};

/**
 * Accessibility validator for development
 */
export const a11yValidator = {
  // Check if element has accessible name
  hasAccessibleName: (element) => {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent ||
      element.alt ||
      element.title
    );
  },
  
  // Check if interactive element is keyboard accessible
  isKeyboardAccessible: (element) => {
    const tabIndex = element.getAttribute('tabindex');
    const isNativelyFocusable = ['button', 'input', 'select', 'textarea', 'a'].includes(
      element.tagName.toLowerCase()
    );
    
    return isNativelyFocusable || (tabIndex !== null && tabIndex !== '-1');
  },
  
  // Validate color contrast (basic check)
  hasGoodContrast: (foreground, background) => {
    // This is a simplified check - in production, use a proper contrast calculation library
    const luminance = (color) => {
      const rgb = parseInt(color.replace('#', ''), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = rgb & 0xff;
      return 0.299 * r + 0.587 * g + 0.114 * b;
    };
    
    const contrast = Math.abs(luminance(foreground) - luminance(background));
    return contrast > 125; // Simplified threshold
  }
};

const accessibilityUtils = {
  useFocusTrap,
  useKeyboardNavigation,
  useAccessibleAnnouncement,
  useReducedMotion,
  useAccessibleIds,
  screenReader,
  a11yValidator
};

export default accessibilityUtils;