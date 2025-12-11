export interface FacilitySlotRequest {
  facilityResourceId: number;
  slotStartDate: string;
  slotEndDate: string;
  startTime: string;
  endTime: string;
  isWithWeekend: boolean;
}
