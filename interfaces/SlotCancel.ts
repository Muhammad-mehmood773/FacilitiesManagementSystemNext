export interface SlotCancelRequest {
  slotId: number;
  employeeId: string;
  remarks?: string;
}

export interface SlotActionResponse {
  slotId?: number;
  message?: string;
}

export interface CancelSlotPayload {
  slotId: number;
  employeeId: number;
}
