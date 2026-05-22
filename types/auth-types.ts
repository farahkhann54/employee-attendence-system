export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'employee';
  isProfileComplete: boolean;
  name?: string;
  displayName?: string;
  fatherName?: string;
  cnic?: string;
  phone?: string;
  dob?: string;
  address?: string;
  city?: string;
  jobField?: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}
