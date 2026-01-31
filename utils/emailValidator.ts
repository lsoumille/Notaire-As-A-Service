// List of common disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  'yopmail.com',
  'yopmail.fr',
  'guerrillamail.com',
  'mailinator.com',
  'temp-mail.org',
  'throwaway.email',
  '10minutemail.com',
  'tempmail.com',
  'trashmail.com',
  'maildrop.cc',
  'getnada.com',
  'fakeinbox.com',
  'sharklasers.com',
  'guerrillamail.info',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'spam4.me',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'spamgourmet.com',
  'mytemp.email',
  'mohmal.com',
  'emailondeck.com'
];

/**
 * Validates an email address format
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Checks if an email is from a disposable email provider
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

/**
 * Validates email and checks if it's not disposable
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: "L'adresse email est requise" };
  }

  if (!isValidEmailFormat(email)) {
    return { isValid: false, error: "Format d'email invalide" };
  }

  if (isDisposableEmail(email)) {
    return { isValid: false, error: "Les adresses email jetables ne sont pas acceptées" };
  }

  return { isValid: true };
}
