// lib/validation.js
import { sanitizeInput, sanitizeText, sanitizeUrl } from './sanitize';

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Common validation patterns
 */
const patterns = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  phone: /^\+?[\d\s\-\(\)]{10,}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  mongoId: /^[0-9a-fA-F]{24}$/,
};

/**
 * Basic validators
 */
export const validators = {
  required: (value) => {
    if (value === null || value === undefined || value === '') {
      throw new ValidationError('Ce champ est obligatoire');
    }
    return value;
  },

  string: (value, options = {}) => {
    if (typeof value !== 'string') {
      throw new ValidationError('Doit être une chaîne de caractères');
    }
    
    const sanitized = sanitizeText(value);
    
    if (options.minLength && sanitized.length < options.minLength) {
      throw new ValidationError(`Doit contenir au moins ${options.minLength} caractères`);
    }
    
    if (options.maxLength && sanitized.length > options.maxLength) {
      throw new ValidationError(`Ne peut pas dépasser ${options.maxLength} caractères`);
    }
    
    if (options.pattern && !options.pattern.test(sanitized)) {
      throw new ValidationError(options.patternMessage || 'Format invalide');
    }
    
    return sanitized;
  },

  email: (value) => {
    const email = validators.string(value, { maxLength: 255 });
    if (!patterns.email.test(email)) {
      throw new ValidationError('Adresse email invalide');
    }
    return email.toLowerCase();
  },

  phone: (value) => {
    const phone = validators.string(value, { maxLength: 20 });
    if (!patterns.phone.test(phone)) {
      throw new ValidationError('Numéro de téléphone invalide');
    }
    return phone.replace(/\s/g, '');
  },

  url: (value) => {
    const url = validators.string(value, { maxLength: 2000 });
    const sanitizedUrl = sanitizeUrl(url);
    if (!sanitizedUrl) {
      throw new ValidationError('URL invalide');
    }
    return sanitizedUrl;
  },

  number: (value, options = {}) => {
    const num = Number(value);
    if (isNaN(num)) {
      throw new ValidationError('Doit être un nombre');
    }
    
    if (options.min !== undefined && num < options.min) {
      throw new ValidationError(`Doit être supérieur ou égal à ${options.min}`);
    }
    
    if (options.max !== undefined && num > options.max) {
      throw new ValidationError(`Doit être inférieur ou égal à ${options.max}`);
    }
    
    if (options.integer && !Number.isInteger(num)) {
      throw new ValidationError('Doit être un nombre entier');
    }
    
    return num;
  },

  boolean: (value) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1' || value === 1) return true;
    if (value === 'false' || value === '0' || value === 0) return false;
    throw new ValidationError('Doit être vrai ou faux');
  },

  date: (value) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError('Date invalide');
    }
    return date;
  },

  mongoId: (value) => {
    const id = validators.string(value);
    if (!patterns.mongoId.test(id)) {
      throw new ValidationError('ID invalide');
    }
    return id;
  },

  enum: (value, allowedValues) => {
    if (!allowedValues.includes(value)) {
      throw new ValidationError(`Doit être une des valeurs: ${allowedValues.join(', ')}`);
    }
    return value;
  },

  array: (value, itemValidator, options = {}) => {
    if (!Array.isArray(value)) {
      throw new ValidationError('Doit être un tableau');
    }
    
    if (options.minLength && value.length < options.minLength) {
      throw new ValidationError(`Doit contenir au moins ${options.minLength} éléments`);
    }
    
    if (options.maxLength && value.length > options.maxLength) {
      throw new ValidationError(`Ne peut pas contenir plus de ${options.maxLength} éléments`);
    }
    
    return value.map((item, index) => {
      try {
        return itemValidator(item);
      } catch (error) {
        throw new ValidationError(`Élément ${index + 1}: ${error.message}`);
      }
    });
  },

  object: (value, schema) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new ValidationError('Doit être un objet');
    }
    
    const result = {};
    const errors = {};
    
    // Validate each field in schema
    for (const [field, validator] of Object.entries(schema)) {
      try {
        if (typeof validator === 'function') {
          result[field] = validator(value[field]);
        } else if (validator && typeof validator === 'object') {
          // Handle nested validation rules
          result[field] = validateField(value[field], validator);
        }
      } catch (error) {
        errors[field] = error.message;
      }
    }
    
    if (Object.keys(errors).length > 0) {
      const error = new ValidationError('Erreurs de validation');
      error.fields = errors;
      throw error;
    }
    
    return result;
  }
};

/**
 * Validate a single field with multiple rules
 */
export const validateField = (value, rules) => {
  let result = value;
  
  if (Array.isArray(rules)) {
    for (const rule of rules) {
      result = rule(result);
    }
  } else if (typeof rules === 'function') {
    result = rules(result);
  } else if (rules && typeof rules === 'object') {
    // Handle rule objects
    for (const [ruleName, ruleOptions] of Object.entries(rules)) {
      if (validators[ruleName]) {
        result = validators[ruleName](result, ruleOptions);
      }
    }
  }
  
  return result;
};

/**
 * Validate entire object against schema
 */
export const validate = (data, schema) => {
  return validators.object(data, schema);
};

/**
 * Safe validation that returns result or null
 */
export const safeValidate = (data, schema) => {
  try {
    return { success: true, data: validate(data, schema) };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      fields: error.fields || {}
    };
  }
};

/**
 * Common validation schemas
 */
export const schemas = {
  user: {
    email: (value) => validators.required(validators.email(value)),
    password: (value) => validators.required(validators.string(value, {
      minLength: 8,
      pattern: patterns.password,
      patternMessage: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
    })),
    name: (value) => validators.required(validators.string(value, { 
      minLength: 2, 
      maxLength: 100 
    })),
    phone: validators.phone,
    role: (value) => validators.enum(value, ['user', 'admin', 'moderator'])
  },

  news: {
    title: (value) => validators.required(validators.string(value, { 
      minLength: 5, 
      maxLength: 200 
    })),
    content: (value) => validators.required(validators.string(value, { 
      minLength: 50, 
      maxLength: 10000 
    })),
    excerpt: (value) => validators.string(value, { maxLength: 500 }),
    status: (value) => validators.enum(value, ['draft', 'published', 'archived']),
    tags: (value) => validators.array(value, 
      (tag) => validators.string(tag, { maxLength: 50 }),
      { maxLength: 10 }
    )
  },

  contact: {
    name: (value) => validators.required(validators.string(value, { 
      minLength: 2, 
      maxLength: 100 
    })),
    email: (value) => validators.required(validators.email(value)),
    subject: (value) => validators.required(validators.string(value, { 
      minLength: 5, 
      maxLength: 200 
    })),
    message: (value) => validators.required(validators.string(value, { 
      minLength: 10, 
      maxLength: 2000 
    }))
  },

  document: {
    title: (value) => validators.required(validators.string(value, { 
      minLength: 5, 
      maxLength: 200 
    })),
    description: (value) => validators.string(value, { maxLength: 1000 }),
    type: (value) => validators.enum(value, ['pdf', 'doc', 'image', 'other']),
    status: (value) => validators.enum(value, ['draft', 'published', 'archived'])
  }
};

export default validate;