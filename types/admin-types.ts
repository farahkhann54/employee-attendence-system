export interface AdminData {
  uid: string;
  name: string;
  email: string;
  role: 'admin';
  isProfileComplete: boolean;
}

export interface AdminStatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend: string;
}