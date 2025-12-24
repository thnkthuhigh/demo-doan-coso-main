// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ClassDetail: { classId: string };
  ServiceDetail: { serviceId: string };
  ClubDetail: { clubId: string };
  History: undefined;
  MyClasses: undefined;
  AttendanceCheckIn: { classId: string; className: string };
  Notifications: undefined;
  Statistics: undefined;
  Calendar: undefined;
  QRScanner: undefined;
  ChatList: undefined;
  ChatDetail: { conversationId: string };
  GymFinder: undefined;
  BodyMetrics: undefined;
  Cart: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
  TrainerClasses: undefined;
  AttendanceManagement: { classId: string; className: string };
  AttendanceHistory: { classId?: string; className?: string };
  AttendanceDetail: { classId: string; className: string; date: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Classes: undefined;
  Services: undefined;
  Clubs: undefined;
  Membership: undefined;
  Profile: undefined;
};
