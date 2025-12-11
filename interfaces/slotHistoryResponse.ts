import type { Pagination } from './pagination';

export interface SlotItem {
  slotId: number;
  employeeId: number;
  employeeName: string | null;
  employeePhoto: string | null;
  facilityName: string;
  facilityResourceName: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  facilitySlotStatusName: string;
}

export interface SlotHistoryResponse {
  paginatedResponse: Pagination;
  success: boolean;
  code: string;
  message: string;
  data: SlotItem[];
}
