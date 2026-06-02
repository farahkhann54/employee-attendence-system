export type TimestampLike = {
  toDate: () => Date;
} | Date | string | number | null | undefined;

export type AttendanceMode = 'idle' | 'active' | 'break' | 'loading' | 'checked-in' | 'on-break';

export interface LiveStaffMember {
  uid: string;
  name?: string;
}

export interface WeeklyAttendancePoint {
  day: string;
  date: string;
  present: number;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  onLeave: number;
  lateCheckin: number;
}

export interface AttendanceLog {
  id: string;
  userId: string;
  userName?: string;
  date: string;
  checkIn?: TimestampLike;
  checkOut?: TimestampLike;
  breakStart?: TimestampLike;
  breakEnd?: TimestampLike;
  status?: string;
  lateCheckIn?: boolean;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName?: string;
  reason: string;
  startDate: string;
  endDate: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: TimestampLike;
  actionedAt?: TimestampLike;
}

export interface DirectoryMember {
  id: string;
  uid: string;
  name?: string;
  email?: string;
  role?: 'admin' | 'employee' | string;
  jobField?: string;
  createdAt?: TimestampLike;
  photoURL?: string;
  city?: string;
  phone?: string;
  cnic?: string;
  fatherName?: string;
  address?: string;
}

export interface ProfileFormValues {
  name: string;
  fatherName: string;
  cnic: string;
  phone: string;
  joinedDate: string;
  address: string;
  photoURL: string;
}
