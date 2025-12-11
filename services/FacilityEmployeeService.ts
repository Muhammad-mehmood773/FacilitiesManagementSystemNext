import api from '../api/axiosInstance';
import type { EmployeeResponse } from '../interfaces/employeeResponse';

export const FacilityEmployeeService = {
  getEmployeeById(employeeId: number): Promise<{ data: EmployeeResponse }> {
    return api.get(`/FacilityEmployee/get-employee-by-id?employeeId=${employeeId}`);
  },

  getEmployeeByKeyword(keyword: string) {
    return api.get(`/FacilityEmployee/quick-search?keyword=${keyword}`);
  },
};
