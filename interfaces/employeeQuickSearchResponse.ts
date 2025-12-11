export interface EmployeeQuickResponse {
  employeeId: number;
  employeeCode: string;
  fullName: string;
  employeePhoto: string;
  facilityRoleId: number;
  facilityRoleName: string;
  departmentId: number;
  departmentName: string;
  officialEmailAddress: string;
  phoneNo: string;
  mobileNo: string;
  designationId: number;
  designationName: string;
  locationId: number;
  locationName: string;
}

export interface EmployeeOption {
  value: number;
  label: string;
  avatar?: string;
  departmentName?: string;
}
