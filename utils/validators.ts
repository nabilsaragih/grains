export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

export function isStrongPassword(password: string): boolean {
  if (!password || password.length < 8) {
    return false;
  }

  const strongPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return strongPattern.test(password);
}

export interface PasswordValidationResult {
  isValid: boolean;
  password?: string;
  errorTitle?: string;
  errorMessage?: string;
}

export function validatePasswordChange(password: string, confirmPassword: string): PasswordValidationResult {
  const trimmedPassword = password.trim();
  const trimmedConfirm = confirmPassword.trim();

  if (!trimmedPassword || !trimmedConfirm) {
    return {
      isValid: false,
      errorTitle: 'Password Belum Lengkap',
      errorMessage: 'Isi password baru dan konfirmasi terlebih dahulu.',
    };
  }

  if (!isStrongPassword(trimmedPassword)) {
    return {
      isValid: false,
      errorTitle: 'Password Lemah',
      errorMessage: 'Password minimal 8 karakter dengan kombinasi huruf, angka, dan simbol.',
    };
  }

  if (trimmedPassword !== trimmedConfirm) {
    return {
      isValid: false,
      errorTitle: 'Konfirmasi Tidak Cocok',
      errorMessage: 'Password baru dan konfirmasi harus sama.',
    };
  }

  return { isValid: true, password: trimmedPassword };
}
