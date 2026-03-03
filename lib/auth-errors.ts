export function authErrorMessage(code?: string, description?: string) {
  if (code === 'otp_expired') {
    return 'This email link has expired. Request a new invite or password reset link and open it right away.';
  }
  if (code === 'access_denied') {
    return 'This sign-in link was denied. Request a fresh link and try again.';
  }
  if (description) return decodeURIComponent(description.replace(/\+/g, ' '));
  return 'Authentication failed. Please try again.';
}
