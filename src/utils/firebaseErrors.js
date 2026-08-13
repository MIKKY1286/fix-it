/**
 * Maps Firebase Auth and Firestore error codes/messages to premium, user-friendly copy.
 */
export const getFriendlyErrorMessage = (error) => {
  if (!error) return '';
  
  const code = error.code || error.message || '';
  
  if (code.includes('auth/email-already-in-use')) {
    return 'This email address is already registered to another account.';
  }
  if (code.includes('auth/invalid-email')) {
    return 'The email address format is invalid. Please check and try again.';
  }
  if (code.includes('auth/operation-not-allowed')) {
    return 'Email/Password authentication is currently disabled. Please contact support.';
  }
  if (code.includes('auth/weak-password')) {
    return 'The password is too weak. It must be at least 6 characters long.';
  }
  if (code.includes('auth/wrong-password')) {
    return 'Incorrect password. Please verify and try again.';
  }
  if (code.includes('auth/user-not-found')) {
    return 'No registered account found with this email address.';
  }
  if (code.includes('auth/user-disabled')) {
    return 'This account has been disabled. Please contact support.';
  }
  if (code.includes('auth/too-many-requests')) {
    return 'Too many failed login attempts. Access has been temporarily locked.';
  }
  if (code.includes('auth/network-request-failed') || code.includes('client-offline') || code.includes('offline')) {
    return 'Network connection issue. Please check your internet connection and try again.';
  }
  if (code.includes('auth/invalid-credential')) {
    return 'Invalid credentials. Please verify your email and password and try again.';
  }
  
  // Return cleaned original message as fallback
  return error.message ? error.message.replace('Firebase: ', '') : 'An unexpected error occurred. Please try again.';
};
