// Utility functions for input validation to prevent emojis and symbols

export const inputValidation = {
  // Remove emojis and symbols from text, keeping only letters, numbers, spaces, and basic punctuation
  sanitizeText: (text: string): string => {
    // Allow letters (including Arabic), numbers, spaces, and basic punctuation
    return text.replace(/[^\p{L}\p{N}\s.,!?'-]/gu, '');
  },

  // Remove emojis and symbols from names (more restrictive)
  sanitizeName: (text: string): string => {
    // Allow only letters (including Arabic), spaces, hyphens, and apostrophes
    return text.replace(/[^\p{L}\s'-]/gu, '');
  },

  // Remove emojis and symbols from email (keep email-valid characters)
  sanitizeEmail: (text: string): string => {
    // Allow letters, numbers, and email-specific characters
    return text.replace(/[^\p{L}\p{N}@._-]/gu, '');
  },

  // Remove emojis and symbols from numbers (keep only digits and basic formatting)
  sanitizeNumber: (text: string): string => {
    // Allow only digits, spaces, hyphens, and plus sign
    return text.replace(/[^\d\s+-]/g, '');
  },

  // Remove emojis and symbols from medical text (allow more punctuation for medical terms)
  sanitizeMedicalText: (text: string): string => {
    // Allow letters, numbers, spaces, and medical punctuation
    return text.replace(/[^\p{L}\p{N}\s.,!?'"-:;()/]/gu, '');
  },

  // Handle input events to prevent emojis and symbols
  handleTextInput: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setter: (value: string) => void,
    type: 'text' | 'name' | 'email' | 'number' | 'medical' = 'text'
  ) => {
    const value = event.target.value;
    let sanitizedValue: string;

    switch (type) {
      case 'name':
        sanitizedValue = inputValidation.sanitizeName(value);
        break;
      case 'email':
        sanitizedValue = inputValidation.sanitizeEmail(value);
        break;
      case 'number':
        sanitizedValue = inputValidation.sanitizeNumber(value);
        break;
      case 'medical':
        sanitizedValue = inputValidation.sanitizeMedicalText(value);
        break;
      default:
        sanitizedValue = inputValidation.sanitizeText(value);
    }

    // Only update if the value changed (to prevent cursor jumping)
    if (sanitizedValue !== value) {
      setter(sanitizedValue);
    } else {
      setter(value);
    }
  },

  // Validate if text contains emojis or unwanted symbols
  containsEmojisOrSymbols: (text: string, type: 'text' | 'name' | 'email' | 'number' | 'medical' = 'text'): boolean => {
    let sanitized: string;
    
    switch (type) {
      case 'name':
        sanitized = inputValidation.sanitizeName(text);
        break;
      case 'email':
        sanitized = inputValidation.sanitizeEmail(text);
        break;
      case 'number':
        sanitized = inputValidation.sanitizeNumber(text);
        break;
      case 'medical':
        sanitized = inputValidation.sanitizeMedicalText(text);
        break;
      default:
        sanitized = inputValidation.sanitizeText(text);
    }

    return sanitized !== text;
  }
};