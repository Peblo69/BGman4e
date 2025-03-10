/**
 * Utility for translating Firebase error codes to user-friendly Bulgarian messages
 * without mentioning Firebase or exposing internal error codes to users.
 */

export type FirebaseErrorCode = 
  | 'auth/invalid-credential'
  | 'auth/user-disabled' 
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/invalid-email'
  | 'auth/missing-password'
  | 'auth/too-many-requests'
  | 'auth/network-request-failed'
  | 'auth/popup-closed-by-user'
  | 'auth/internal-error'
  | 'auth/requires-recent-login'
  | 'auth/account-exists-with-different-credential'
  | 'auth/operation-not-allowed'
  | 'auth/cancelled-popup-request'
  | 'auth/popup-blocked'
  | 'auth/missing-email'
  | string;  // For any other error codes

// Map Firebase error codes to Bulgarian error messages
const errorMessages: Record<string, string> = {
  'auth/invalid-credential': 'Грешен имейл или парола. Моля, опитайте отново.',
  'auth/user-disabled': 'Този акаунт е деактивиран. Моля, свържете се с администратор.',
  'auth/user-not-found': 'Няма потребител с този имейл адрес.',
  'auth/wrong-password': 'Грешна парола. Моля, опитайте отново.',
  'auth/email-already-in-use': 'Този имейл адрес вече се използва от друг акаунт.',
  'auth/weak-password': 'Паролата е твърде слаба. Използвайте поне 6 символа.',
  'auth/invalid-email': 'Невалиден имейл адрес.',
  'auth/missing-password': 'Моля, въведете парола.',
  'auth/too-many-requests': 'Твърде много опити. Моля, опитайте отново по-късно.',
  'auth/network-request-failed': 'Проблем с мрежовата връзка. Проверете интернет свързаността си.',
  'auth/popup-closed-by-user': 'Затворихте прозореца за удостоверяване преди завършване.',
  'auth/internal-error': 'Възникна вътрешна грешка. Моля, опитайте отново.',
  'auth/requires-recent-login': 'Моля, влезте отново в акаунта си преди тази операция.',
  'auth/account-exists-with-different-credential': 'Акаунт с този имейл вече съществува с друг метод за вход.',
  'auth/operation-not-allowed': 'Тази операция не е разрешена.',
  'auth/cancelled-popup-request': 'Операцията е отменена.',
  'auth/popup-blocked': 'Изскачащият прозорец беше блокиран от браузъра ви.',
  'auth/missing-email': 'Моля, въведете имейл адрес.'
};

// Default error message for unhandled error codes
const DEFAULT_ERROR_MESSAGE = 'Възникна грешка при удостоверяване. Моля, опитайте отново.';

/**
 * Translates a Firebase error code to a user-friendly Bulgarian message
 * @param errorCode The Firebase error code or error object
 * @returns Localized Bulgarian error message
 */
export function getFirebaseErrorMessage(errorCode: FirebaseErrorCode | Error | unknown): string {
  // Handle if we get an Error object directly
  if (errorCode instanceof Error) {
    const message = errorCode.message || '';
    
    // Try to extract Firebase error code from error message
    const codeMatch = message.match(/\(([^)]+)\)/);
    if (codeMatch && codeMatch[1]) {
      errorCode = codeMatch[1];
    } else {
      return DEFAULT_ERROR_MESSAGE;
    }
  }
  
  // If it's an object with a code property (Firebase error object)
  if (typeof errorCode === 'object' && errorCode !== null && 'code' in errorCode) {
    errorCode = (errorCode as { code: string }).code;
  }
  
  // If we have a string error code
  if (typeof errorCode === 'string') {
    return errorMessages[errorCode] || DEFAULT_ERROR_MESSAGE;
  }
  
  return DEFAULT_ERROR_MESSAGE;
}