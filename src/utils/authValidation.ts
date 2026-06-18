export const PASSWORD_RULE_MESSAGE =
  "비밀번호는 영문, 숫자, 특수기호 중 2가지 이상을 포함하여 8자 이상 20자 이하로 입력해주세요.";

export const validatePassword = (password: string): boolean => {
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9\s]/.test(password);
  const hasNoSpace = !/\s/.test(password);
  const typeCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;

  return (
    password.length >= 8 &&
    password.length <= 20 &&
    typeCount >= 2 &&
    hasNoSpace
  );
};

export const getPasswordRuleState = (password: string) => {
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9\s]/.test(password);
  const hasNoSpace = !/\s/.test(password);
  const isLengthValid = password.length >= 8 && password.length <= 20;
  const typeCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;

  return {
    hasLetter,
    hasNumber,
    hasSpecial,
    hasNoSpace,
    isLengthValid,
    typeCount,
    isValid: isLengthValid && typeCount >= 2 && hasNoSpace,
  };
};

export const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainSeconds}`;
};
