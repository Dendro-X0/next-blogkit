export * from "./forgot-password";
export * from "./login";
export * from "./signup";
export * from "./user";
export * from "./two-factor";

// Re-export specific functions with the names expected by the imports
export { forgotPasswordAction as sendPasswordResetLink } from "./forgot-password";
export { resetPasswordAction as resetPassword } from "./reset-password";
export { verifyTwoFactorCode } from "./two-factor";
export { generateTwoFactorSecret } from "./two-factor";
export { enableTwoFactor } from "./two-factor";
export { disableTwoFactor } from "./two-factor";
