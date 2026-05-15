export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'employee';
  isProfileComplete: boolean;
  name?: string;
  displayName?: string;
  fatherName?: string;
  cnic?: string;
  dob?: string;
  jobField?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}
