export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://kopbnkasso.runasp.net/restapi/v1.0';

export const API_ENDPOINTS = {
  auth: {
    login: 'Auth/Login',
    sendOtp: 'Auth/SendOtp',
    verifyOtp: 'Auth/VerifyOtp',
    forgotPassword: 'Auth/ForgotPassword',
    resetPassword: 'Auth/ResetPassword',
  },
  account: {
    me: 'Account/Me',
    changePassword: 'Account/ChangePassword',
    logout: 'Account/Logout',
  },
  bank: {
    create: 'Bank/Create',
    update: 'Bank/Update',
    getAll: 'Bank/GetAll',
    getById: (bankId: number) => `Bank/GetbyId/${bankId}`,
    getDropdown: 'Bank/GetDrowpdown',
    toggleActive: (bankId: number) => `Bank/ToggleActive/${bankId}`,
  },
  vacancy: {
    create: 'vacancy/create',
    getAll: 'vacancy/getall',
    update: 'Vacancy/Update',
    publish: 'Vacancy/Publish',
  },
} as const;
