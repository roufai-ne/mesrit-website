import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date with customizable options
 * @param {Date|string} date - The date to format
 * @param {Object} options - Formatting options
 * @param {string} options.locale - Locale for formatting (default: 'fr-FR')
 * @param {Object} options.dateOptions - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const {
      locale = 'fr-FR',
      dateOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    } = options;
    
    return new Intl.DateTimeFormat(locale, dateOptions).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format a date for relative time display (e.g., "il y a 2 heures")
 * @param {Date|string} date - The date to format
 * @param {string} locale - Locale for formatting (default: 'fr-FR')
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date, locale = 'fr-FR') {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    
    if (diffInSeconds < 60) {
      return 'à l\'instant';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }
    
    // For dates older than a week, use the full date format
    return formatDate(dateObj, { locale, dateOptions: { year: 'numeric', month: 'short', day: 'numeric' } });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
}

/**
 * Format a date for short display (e.g., "15 Jan 2024")
 * @param {Date|string} date - The date to format
 * @param {string} locale - Locale for formatting (default: 'fr-FR')
 * @returns {string} Short date string
 */
export function formatShortDate(date, locale = 'fr-FR') {
  return formatDate(date, {
    locale,
    dateOptions: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  });
}

/**
 * Format a date for time display only (e.g., "14:30")
 * @param {Date|string} date - The date to format
 * @param {string} locale - Locale for formatting (default: 'fr-FR')
 * @returns {string} Time string
 */
export function formatTime(date, locale = 'fr-FR') {
  return formatDate(date, {
    locale,
    dateOptions: {
      hour: '2-digit',
      minute: '2-digit'
    }
  });
}