// import client from './client';

// type ApiResponse<T> = { message: string; data: T; statusCode: number };

// export const loginApi = (email: string, password: string) =>
//   client.post<ApiResponse<{ accessToken: string }>>('/auth/login', { email, password });

// export const logoutApi = () => client.post('/auth/logout');

// export const sendEmailVerificationApi = (email: string) =>
//   client.post<ApiResponse<{ emailVerificationId: string }>>('/auth/email-verification/send', {
//     email,
//     purpose: 'SIGNUP',
//   });

// export const verifyEmailVerificationApi = (emailVerificationId: string, codeNumber: string) =>
//   client.post<ApiResponse<boolean>>('/auth/email-verification/verify', {
//     emailVerificationId,
//     codeNumber,
//   });

// export const signupApi = (data: {
//   email: string;
//   password: string;
//   nickname: string;
//   pinNumber: string;
//   emailVerificationId: string;
// }) => client.post<ApiResponse<null>>('/auth/signup', data);
