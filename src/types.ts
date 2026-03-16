export interface Institution {
  institutionId: string;
  name: string;
  adminName: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Student {
  studentId: string;
  institutionId: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  class: string;
  section: string;
  rollNumber: string;
  fatherName: string;
  motherName: string;
  phone: string;
  address: string;
  classTeacher: string;
  admissionDate: string;
  monthlyFee: number;
  createdAt: string;
}

export interface Payment {
  paymentId: string;
  studentId: string;
  institutionId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  receiptNumber: string;
  notes?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalFeesCollected: number;
  pendingFees: number;
  todayCollection: number;
}
