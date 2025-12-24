// API Configuration
const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Android Emulator
// const API_BASE_URL = 'http://localhost:5000/api'; // iOS Simulator  
// const API_BASE_URL = 'http://YOUR_IP:5000/api'; // Physical device

export const CONFIG = {
  API_BASE_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/signup',
      PROFILE: '/auth/profile',
    },
    USERS: {
      LIST: '/users',
      DETAIL: '/users',
      UPDATE: '/users',
    },
    CLASSES: {
      LIST: '/classes',
      DETAIL: '/classes',
      REGISTER: '/classes/register',
      UNREGISTER: '/classes/unregister',
      MY_CLASSES: '/classes/my-classes',
    },
    MEMBERSHIPS: {
      LIST: '/memberships',
      DETAIL: '/memberships',
      PURCHASE: '/memberships/purchase',
      MY_MEMBERSHIP: '/memberships/my-membership',
    },
    PAYMENTS: {
      LIST: '/payments',
      CREATE: '/payments',
      MY_PAYMENTS: '/payments/my-payments',
    },
    SERVICES: {
      LIST: '/services',
      DETAIL: '/services',
    },
    CLUBS: {
      LIST: '/clubs',
      DETAIL: '/clubs',
    },
    ATTENDANCE: {
      CHECKIN: '/attendance/checkin',
      MY_ATTENDANCE: '/attendance/my-attendance',
    },
    CALENDAR: {
      USER_EVENTS: '/calendar/user',
    },
  },
};

export default CONFIG;
