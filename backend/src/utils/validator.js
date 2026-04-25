const validator = require('validator');

function validateEmail(email) {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  if (!validator.isEmail(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  return { valid: true };
}

function validatePhone(phone) {
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }
  if (!validator.isMobilePhone(phone, 'zh-CN')) {
    return { valid: false, message: 'Invalid phone number format' };
  }
  return { valid: true };
}

function validatePassword(password) {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  if (password.length > 20) {
    return { valid: false, message: 'Password must be less than 20 characters' };
  }
  return { valid: true };
}

function validateAmount(amount) {
  if (amount === undefined || amount === null) {
    return { valid: false, message: 'Amount is required' };
  }
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    return { valid: false, message: 'Amount must be a number' };
  }
  if (numAmount <= 0) {
    return { valid: false, message: 'Amount must be greater than 0' };
  }
  return { valid: true };
}

function validateCardNumber(cardNumber) {
  if (!cardNumber) {
    return { valid: false, message: 'Card number is required' };
  }
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!validator.isCreditCard(cleaned)) {
    return { valid: false, message: 'Invalid card number format' };
  }
  if (cleaned.length < 13 || cleaned.length > 19) {
    return { valid: false, message: 'Card number must be between 13 and 19 digits' };
  }
  return { valid: true };
}

function validateIdCard(idCard) {
  if (!idCard) {
    return { valid: false, message: 'ID card is required' };
  }
  if (!validator.isIdentityCard(idCard, 'zh-CN')) {
    return { valid: false, message: 'Invalid ID card format' };
  }
  return { valid: true };
}

function validateString(value, fieldName, minLength = 1, maxLength = 100) {
  if (!value) {
    return { valid: false, message: `${fieldName} is required` };
  }
  if (typeof value !== 'string') {
    return { valid: false, message: `${fieldName} must be a string` };
  }
  if (value.length < minLength) {
    return { valid: false, message: `${fieldName} must be at least ${minLength} characters` };
  }
  if (value.length > maxLength) {
    return { valid: false, message: `${fieldName} must be less than ${maxLength} characters` };
  }
  return { valid: true };
}

function validateInteger(value, fieldName, min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (value === undefined || value === null) {
    return { valid: false, message: `${fieldName} is required` };
  }
  const numValue = parseInt(value, 10);
  if (isNaN(numValue)) {
    return { valid: false, message: `${fieldName} must be an integer` };
  }
  if (numValue < min) {
    return { valid: false, message: `${fieldName} must be at least ${min}` };
  }
  if (numValue > max) {
    return { valid: false, message: `${fieldName} must be at most ${max}` };
  }
  return { valid: true };
}

function validateDate(value, fieldName) {
  if (!value) {
    return { valid: false, message: `${fieldName} is required` };
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { valid: false, message: `${fieldName} must be a valid date` };
  }
  return { valid: true };
}

function validateUrl(url) {
  if (!url) {
    return { valid: false, message: 'URL is required' };
  }
  if (!validator.isURL(url)) {
    return { valid: false, message: 'Invalid URL format' };
  }
  return { valid: true };
}

function validateObject(value, fieldName) {
  if (!value) {
    return { valid: false, message: `${fieldName} is required` };
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    return { valid: false, message: `${fieldName} must be an object` };
  }
  return { valid: true };
}

function validateArray(value, fieldName, minLength = 0, maxLength = Number.MAX_SAFE_INTEGER) {
  if (!value) {
    return { valid: false, message: `${fieldName} is required` };
  }
  if (!Array.isArray(value)) {
    return { valid: false, message: `${fieldName} must be an array` };
  }
  if (value.length < minLength) {
    return { valid: false, message: `${fieldName} must have at least ${minLength} items` };
  }
  if (value.length > maxLength) {
    return { valid: false, message: `${fieldName} must have at most ${maxLength} items` };
  }
  return { valid: true };
}

function validateEnum(value, fieldName, allowedValues) {
  if (!value) {
    return { valid: false, message: `${fieldName} is required` };
  }
  if (!allowedValues.includes(value)) {
    return { valid: false, message: `${fieldName} must be one of: ${allowedValues.join(', ')}` };
  }
  return { valid: true };
}

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateAmount,
  validateCardNumber,
  validateIdCard,
  validateString,
  validateInteger,
  validateDate,
  validateUrl,
  validateObject,
  validateArray,
  validateEnum
};
