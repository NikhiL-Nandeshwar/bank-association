export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://kopbnkasso.runasp.net/restapi/v1.0';

export const API_ENDPOINTS = {
  auth: {
    login: 'Auth/Login',
    refresh: 'Auth/Refresh',

    signup: 'Auth/Signup',
    sendOtp: 'Auth/SendOtp',
    verifyOtp: 'Auth/VerifyOtp',
    verifyForgotPasswordOtp: 'Auth/VerifyForgotPasswordOtp',
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
    uploadNoticePdf: 'Vacancy/UploadNoticePdf',
    getPublicList: 'Vacancy/GetPublicList',
    getEligibilityCriteria: (vacancyId: number) => `Vacancy/GetEligibilityCriteria?vacancyId=${vacancyId}`,
  },
  master: {
    getAllMasters: 'Master/GetAllMasters',
    getCategories: 'Master/GetCategories',
    getReligions: 'Master/GetReligions',
    getCastes: 'Master/GetCastes',
    getSubCastes: 'Master/GetSubCastes',
    getNationalities: 'Master/GetNationalities',
    getCountries: 'Master/GetCountries',
    getStates: 'Master/GetStates',
    getDistricts: 'Master/GetDistricts',
    getTalukas: 'Master/GetTalukas',
  },
  news: {
    create: 'news/create',
    getAll: 'news/GetAll',
    update: 'news/update',
    getPublic: 'news/GetPublic',
  },
  application: {
    step1and2: 'Application/SaveStep1',
    step3: 'Application/SaveStep2',
    startOrResume: 'Application/StartOrResume',
  }
} as const;
