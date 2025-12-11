export interface EmployeeResponse {
  success: boolean;
  code: string;
  message: string;
  data: EmployeeData;
}

export interface EmployeeData {
  employeeId: number;
  fullName: string;
  employeePhoto: string;
  facilityRoleId: number;
  facilityRoleName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T | null;
}
