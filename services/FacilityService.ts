import api from '../api/axiosInstance';
import type { ApiResponse } from '../interfaces/employeeResponse';
import type { FacilityResource } from '../interfaces/facilityResourceResponse';
import type { Facility } from '../interfaces/facilityResponse';
import type { BookingPayload } from '../interfaces/slotBookingRequest';

export const FacilityService = {
  getHistory() {
    return api.get('/user/history');
  },

  getFacilities(): Promise<ApiResponse<Facility[]>> {
    return api.get('/Facility/get-all-facilities').then((res) => res.data);
  },

  getFacilitiesResources(id: number): Promise<ApiResponse<FacilityResource[]>> {
    return api
      .get(`/Facility/get-facility-resources?facilityId=${id}`)
      .then((res) => res.data);
  },

  createBookingSlot(payload: BookingPayload): Promise<ApiResponse<any>> {
    return api.post('/FacilityBooking', payload).then((res) => res.data);
  },
};
