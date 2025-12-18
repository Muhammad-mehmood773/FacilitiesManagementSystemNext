import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import Checkbox from '../components/Checkbox';
import DateInput from '../components/DateInput';
import TimeInput from '../components/TimeInput';
import SelectInput from '../components/SelectInput';
import Button from '../components/Button';
import type { Facility } from '../interfaces/facilityResponse';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import type { FacilitySlotRequest } from '../interfaces/facilitySlotRequest';
import { FacilitySlotService } from '../services/FacilitySlot';
import type { GetServerSideProps } from 'next';
import { requireEmployee } from '../utils/ssrAuth';
import { createServerApi } from '../api/serverApi';
import type { ApiResponse } from '../interfaces/employeeResponse';

type FacilityOption = { label: string; value: number | string };

type PageProps = {
  userName: string;
  userPhoto: string;
  roleId: string;
  facilityOptions: FacilityOption[];
};

export default function CreateSlotPage({ userName, userPhoto, roleId, facilityOptions }: PageProps) {
  return (
    <MainLayout userName={userName} userPhoto={userPhoto} roleId={roleId}>
      <AddSlot facilityOptions={facilityOptions} />
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx) => {
  const auth = await requireEmployee(ctx, { allowedRoleIds: [1, 2] });
  if (auth.kind === 'redirect') {
    return {
      redirect: {
        destination: auth.destination,
        permanent: false,
      },
    };
  }

  const api = createServerApi(auth.loginId);
  const facilitiesRes = await api.get<ApiResponse<Facility[]>>('/Facility/get-all-facilities');
  const facilities = facilitiesRes.data?.data || [];

  const options: FacilityOption[] = [
    { label: 'Select Facility', value: '' },
    ...facilities.map((f) => ({ label: f.facilityName, value: f.facilityId })),
  ];

  return {
    props: {
      userName: auth.employee.fullName,
      userPhoto: auth.employee.employeePhoto,
      roleId: auth.employee.facilityRoleName,
      facilityOptions: options,
    },
  };
};

function AddSlot({ facilityOptions }: { facilityOptions: FacilityOption[] }) {
  const [facility, setFacility] = useState<string | number | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [includeWeekend, setIncludeWeekend] = useState(false);

  const [facilityOptionsState] = useState<FacilityOption[]>(facilityOptions);

  const router = useRouter();

  const [errors, setErrors] = useState({
    facility: false,
    startDate: false,
    endDate: false,
    startTime: false,
    endTime: false,
  });

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    document.title = 'Create Slot';
  }, []);

  const handleSubmit = async () => {
    let hasError = false;

    if (facility === '' || facility === 0) {
      hasError = true;
      setErrors((prev) => ({ ...prev, facility: true }));
    }
    if (!startDate) {
      hasError = true;
      setErrors((prev) => ({ ...prev, startDate: true }));
    }
    if (!endDate) {
      hasError = true;
      setErrors((prev) => ({ ...prev, endDate: true }));
    }
    if (!startTime) {
      hasError = true;
      setErrors((prev) => ({ ...prev, startTime: true }));
    }
    if (!endTime) {
      hasError = true;
      setErrors((prev) => ({ ...prev, endTime: true }));
    }

    if (startTime && endTime && endTime <= startTime) {
      hasError = true;
      setErrors((prev) => ({ ...prev, endTime: true }));
      toast.error('End Time must be after Start Time!');
    }

    if (hasError) return;

    const payload: FacilitySlotRequest = {
      facilityResourceId: Number(facility),
      slotStartDate: formatDate(startDate!),
      slotEndDate: formatDate(endDate!),
      startTime: startTime!.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      endTime: endTime!.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      isWithWeekend: includeWeekend,
    };

    setLoading(true);

    try {
      await FacilitySlotService.createSlots(payload);
      toast.success('Slot Created successfully!');
      router.push('/history');
    } catch (err) {
      console.error('Error saving slot:', err);
      toast.error('Failed to create slot!');
    } finally {
      setLoading(false);
    }
  };

  const computeSummary = () => {
    if (!(startTime && endTime && startDate && endDate)) {
      return '0 hrs | 0 slots/day | 0 days | 0 total slots';
    }

    const diffMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    const totalHours = (diffMinutes / 60).toFixed(2);
    const totalSlots = Math.round(diffMinutes / 30);

    let diffDays = 0;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (includeWeekend || (dayOfWeek !== 0 && dayOfWeek !== 6)) diffDays++;
    }

    const totalSlotsAllDays = totalSlots * diffDays;
    return `${totalHours} hrs | ${totalSlots} slots/day | ${diffDays} days | ${totalSlotsAllDays} total slots ${
      includeWeekend ? '(Weekends included)' : '(Weekends excluded)'
    }`;
  };

  return (
    <div className="container-fluid p-4">
      <div className="card premium-card">
        <div className="card-header premium-header d-flex justify-content-between align-items-center">
          <h5 className="card-title m-0 fw-bold">Schedule a Slot</h5>
          <div>
            <span className="header-meta">{computeSummary()}</span>
          </div>
        </div>

        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-6">
              <SelectInput
                label="Select Facility"
                value={facility}
                required
                options={facilityOptionsState}
                onChange={(value) => {
                  setFacility(value);
                  setErrors((prev) => ({ ...prev, facility: value === '' }));
                }}
                error={errors.facility}
              />
              {errors.facility && <small className="text-danger">Facility is required</small>}
            </div>

            <div className="col-md-6 p-4 ">
              <Checkbox label="Include Weekend Slot" checked={includeWeekend} onChange={() => setIncludeWeekend(!includeWeekend)} />
            </div>

            <div className="col-md-6">
              <DateInput
                label="Start Date"
                value={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  setErrors((prev) => ({ ...prev, startDate: !date }));
                }}
                required
                error={errors.startDate}
                disablePastDates={true}
              />
            </div>

            <div className="col-md-6">
              <DateInput
                label="End Date"
                value={endDate}
                onChange={(date) => {
                  setEndDate(date);
                  setErrors((prev) => ({ ...prev, endDate: !date }));
                }}
                required
                error={errors.endDate}
                disablePastDates={true}
              />
            </div>

            <div className="col-md-6">
              <TimeInput
                label="Start Time"
                value={startTime}
                onChange={(date) => {
                  setStartTime(date);
                  setErrors((prev) => ({ ...prev, startTime: !date }));
                }}
                required
                error={errors.startTime}
                interval={30}
              />
            </div>

            <div className="col-md-6">
              <TimeInput
                label="End Time"
                value={endTime}
                onChange={(date) => {
                  setEndTime(date);
                  setErrors((prev) => ({ ...prev, endTime: !date }));
                }}
                required
                error={errors.endTime}
                interval={30}
              />
            </div>
          </div>
        </div>

        <div className="premium-footer text-end">
          <Button label={loading ? 'Loading...' : 'Create Slots'} variant="primary" loading={loading} onClick={handleSubmit} icon="bi-grid" />
        </div>
      </div>
    </div>
  );
}
