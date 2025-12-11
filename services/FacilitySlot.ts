import api from '../api/axiosInstance';
import type { ApiResponse } from '../interfaces/employeeResponse';
import type { FacilitySlot } from '../interfaces/facilitySlot';
import type { FacilitySlotRequest } from '../interfaces/facilitySlotRequest';
import type { CancelSlotPayload, SlotActionResponse } from '../interfaces/SlotCancel';
import type { SlotHistoryResponse } from '../interfaces/slotHistoryResponse';

export interface FacilitySlotFilter {
  pageNumber?: number;
  pageSize?: number;
  employeeId?: string | number;
  startDate?: string;
  endDate?: string;
}

export const FacilitySlotService = {
  getHistory(filter: FacilitySlotFilter = {}): Promise<{ data: SlotHistoryResponse }> {
    return api.get(
      `FacilitySlot/get-all-facility-slot?PageNumber=${filter.pageNumber}&PageSize=${filter.pageSize}&EmployeeId=${filter.employeeId}&StartDate=${filter.startDate}&EndDate=${filter.endDate}`
    );
  },

  getAvailableSlots(id: number, date: string): Promise<ApiResponse<FacilitySlot[]>> {
    return api
      .get(`FacilitySlot/get-all-available-slots?facilityResourceId=${id}&date=${date}`)
      .then((res) => res.data);
  },

  createSlots(payload: FacilitySlotRequest): Promise<ApiResponse<SlotActionResponse>> {
    return api.post('/FacilitySlot/add-facility-slot', payload).then((res) => res.data);
  },

  cancelSlots(payload: CancelSlotPayload): Promise<ApiResponse<SlotActionResponse>> {
    return api.post('/FacilityBooking/cancel-slot', payload).then((res) => res.data);
  },
};
