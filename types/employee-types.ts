export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  isProfileComplete: boolean;
  jobField?: string;
}

export interface DashboardStats {
  presentDays: number;
  pendingTasks: number;
  leaves: number;
}