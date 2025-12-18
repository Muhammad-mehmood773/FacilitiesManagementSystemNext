import React, { useEffect, useMemo, useState } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import MainLayout from '../layouts/MainLayout';
import { FacilityService } from '../services/FacilityService';
import { FacilityEmployeeService } from '../services/FacilityEmployeeService';
import SlotChip from '../components/SlotChips';
import NoSlotsAvailable from '../components/NoSlotsAvailable';
import SelectInput from '../components/SelectInput';
import DateInput from '../components/DateInput';
import Button from '../components/Button';
import type { FacilitySlot } from '../interfaces/facilitySlot';
import SlotSkeleton from '../components/SlotSkeleton';
import type { BookingPayload } from '../interfaces/slotBookingRequest';
import { toast } from 'react-toastify';
import { FacilitySlotService } from '../services/FacilitySlot';
import { useLayoutContext } from '../context/LayoutContext';
import { requireEmployee } from '../utils/ssrAuth';
import { createServerApi } from '../api/serverApi';
import type { ApiResponse } from '../interfaces/employeeResponse';
import type { Facility } from '../interfaces/facilityResponse';
import type { FacilityResource } from '../interfaces/facilityResourceResponse';
import { getCookieValue } from '../utils/cookies';

type OptionType = { label: string; value: string | number };

type PageProps = {
  userName: string;
  userPhoto: string;
  roleId: string;
  facilityOptions: OptionType[];
  tableOptions: OptionType[];
  slots: FacilitySlot[];
  selectedFacilityId: number | null;
  selectedDate: string;
};

export default function BookSlotPage({
  userName,
  userPhoto,
  roleId,
  facilityOptions,
  tableOptions,
  slots,
  selectedFacilityId,
  selectedDate,
}: PageProps) {
  return (
    <MainLayout userName={userName} userPhoto={userPhoto} roleId={roleId}>
      <BookSlot
        initialFacilityOptions={facilityOptions}
        initialTableOptions={tableOptions}
        initialSlots={slots}
        initialFacilityId={selectedFacilityId}
        initialDate={selectedDate}
      />
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

  const facilityOptions: OptionType[] = facilities.map((f) => ({ label: f.facilityName, value: f.facilityId }));

  const facilityIdRaw = typeof ctx.query.facilityId === 'string' ? ctx.query.facilityId : undefined;
  const selectedFacilityId = Number(facilityIdRaw || facilities[0]?.facilityId || 0) || null;

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dateRaw = typeof ctx.query.date === 'string' ? ctx.query.date : undefined;
  const selectedDate = dateRaw || today;

  let tableOptions: OptionType[] = [];
  let slots: FacilitySlot[] = [];

  if (selectedFacilityId != null) {
    try {
      const resourcesRes = await api.get<ApiResponse<FacilityResource[]>>(
        `/Facility/get-facility-resources?facilityId=${encodeURIComponent(String(selectedFacilityId))}`
      );
      const resources = resourcesRes.data?.data || [];
      tableOptions = resources.map((r) => ({ label: r.facilityResourceName, value: r.facilityResourceId }));

      const resourceId = tableOptions[0]?.value;
      if (typeof resourceId === 'number') {
        try {
          const slotsRes = await api.get<ApiResponse<FacilitySlot[]>>(
            `FacilitySlot/get-all-available-slots?facilityResourceId=${encodeURIComponent(String(resourceId))}&date=${encodeURIComponent(selectedDate)}`
          );
          slots = slotsRes.data?.data || [];
        } catch {
          slots = [];
        }
      }
    } catch {
      tableOptions = [];
      slots = [];
    }
  }

  return {
    props: {
      userName: auth.employee.fullName,
      userPhoto: auth.employee.employeePhoto,
      roleId: auth.employee.facilityRoleName,
      facilityOptions,
      tableOptions,
      slots,
      selectedFacilityId,
      selectedDate,
    },
  };
};

function BookSlot({
  initialFacilityOptions,
  initialTableOptions,
  initialSlots,
  initialFacilityId,
  initialDate,
}: {
  initialFacilityOptions: OptionType[];
  initialTableOptions: OptionType[];
  initialSlots: FacilitySlot[];
  initialFacilityId: number | null;
  initialDate: string;
}) {
  const [facility, setFacility] = useState<string | number | null>(null);

  const [tableField, setTableField] = useState<string | number | null>(null);

  const [date, setDate] = useState<Date | null>(null);

  const [facilityOptions] = useState<OptionType[]>(initialFacilityOptions);
  const [tableOptions, setTableOptions] = useState<OptionType[]>(initialTableOptions);

  const [loadingFacilities] = useState(false);
  const [loadingResources] = useState(false);

  const [slots, setSlots] = useState<FacilitySlot[]>(initialSlots);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const { roleId } = useLayoutContext();
  const isAdmin = roleId === 'Super Admin';

  const [selectedEmployee, setSelectedEmployee] = useState<string | number | null>(null);

  const [employeeOptions, setEmployeeOptions] = useState<OptionType[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    facility: false,
    tableField: false,
    date: false,
    selectedEmployee: false,
  });

  const prefill = useMemo(() => {
    const pf = router.query.prefill as string | undefined;
    if (!pf) return null;
    try {
      const parsed = JSON.parse(pf);
      return parsed;
    } catch {
      return null;
    }
  }, [router.query.prefill]);

  useEffect(() => {
    document.title = 'Book Slot';
  }, []);

  useEffect(() => {
    if (initialFacilityId != null) setFacility(initialFacilityId);
    if (initialTableOptions[0]) setTableField(initialTableOptions[0].value);
    if (initialDate) {
      const d = new Date(initialDate);
      if (!Number.isNaN(d.getTime())) setDate(d);
    }
  }, [initialDate, initialFacilityId, initialTableOptions]);

  const handleFacilityChange = (value: string | number | null) => {
    setFacility(value);
    setErrors((prev) => ({ ...prev, facility: !value }));

    if (!value) return;

    const dateStr = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : initialDate;

    router.push({ pathname: '/book-slot', query: { facilityId: value, date: dateStr } });

    loadSlots(value, date);
  };



  const loadSlots = (facilityId = facility, selectedDate = date): Promise<FacilitySlot[]> => {
    if (!facilityId || !selectedDate) return Promise.resolve([] as FacilitySlot[]);

    setLoadingSlots(true);
    setSlots([]);

    const formattedDate =
      selectedDate.getFullYear() +
      '-' +
      String(selectedDate.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(selectedDate.getDate()).padStart(2, '0');

    return FacilitySlotService.getAvailableSlots(Number(facilityId), formattedDate)
      .then((res) => {
        const slotData = res.data || [];
        setSlots(slotData);
        return slotData;
      })
      .finally(() => setLoadingSlots(false));
  };

  const handleEmployeeSearch = (keyword: string) => {
    if (!keyword || keyword.length < 2) return;

    setEmployeeLoading(true);

    FacilityEmployeeService.getEmployeeByKeyword(keyword)
      .then((res) => {
        const employees = res.data?.data || [];
        const options = employees.map((emp: any) => ({
          label: emp.fullName,
          value: emp.employeeId,
          avatar: emp.employeePhoto,
          departmentName: emp.departmentName,
        }));
        setEmployeeOptions(options);
      })
      .catch((err) => console.error('Employee search error:', err))
      .finally(() => setEmployeeLoading(false));
  };

  useEffect(() => {
    if (prefill) {
      const slotIndex = slots.findIndex((s) => s.slotId === prefill.slotId);
      if (slotIndex !== -1) {
        setSelectedSlotIndex(slotIndex);
      }
    }
  }, [prefill, slots]);

  const formatDisplayDate = (d: Date | null) => {
    if (!d) return '';
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSubmit = async () => {
    let hasError = false;

    if (!facility) {
      setErrors((prev) => ({ ...prev, facility: true }));
      hasError = true;
    }

    if (isAdmin && !selectedEmployee) {
      setErrors((prev) => ({ ...prev, selectedEmployee: true }));
      hasError = true;
    }

    if (selectedSlotIndex === null) {
      toast.warning('Please select a slot to book!');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const payload: BookingPayload = {
        slotId: slots[selectedSlotIndex!].slotId,
        employeeId: isAdmin ? Number(selectedEmployee) : Number(getCookieValue(document.cookie, 'loginId')),
      };

      await FacilityService.createBookingSlot(payload);

      setBookedSlots([...bookedSlots, selectedSlotIndex!]);
      setSelectedSlotIndex(null);

      toast.success('Slot booked successfully!');
      router.push('/history');
    } catch (err) {
      console.error('Error saving booking:', err);
      toast.error('Failed to book slot!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4 ">
      <div className="card shadow premium-card">
        <div className="card-header premium-header d-flex justify-content-between align-items-center">
          <h5 className="card-title m-0 fw-bold">Slot Reservation Panel</h5>
        </div>

        <div className="card-body">
          <div className="row">
            <div className="col-md-6 col-lg-6 col-sm-12">
              <div className="mb-3">
                <SelectInput
                  label="Select Facility"
                  value={facility}
                  required
                  options={facilityOptions}
                  onChange={handleFacilityChange}
                  disabled={loadingFacilities}
                  error={errors.facility}
                />
                {errors.facility && <small className="text-danger">Facility is required</small>}
              </div>

              <div className="mb-3" hidden>
                <SelectInput
                  label="Select Table"
                  value={tableField}
                  required
                  options={tableOptions}
                  onChange={(value) => {
                    setTableField(value);
                    setErrors((prev) => ({ ...prev, tableField: !value }));
                  }}
                  disabled={!facility || loadingResources}
                  error={errors.tableField}
                />
                {errors.tableField && <small className="text-danger">Table is required</small>}
              </div>

              <div className="mb-3">
                <DateInput
                  label="Date"
                  value={date}
                  required
                  onChange={(selectedDate) => {
                    setDate(selectedDate);
                    setErrors((prev) => ({ ...prev, date: !selectedDate }));
                    if (!selectedDate) return;

                    const dateStr =
                      selectedDate.getFullYear() +
                      '-' +
                      String(selectedDate.getMonth() + 1).padStart(2, '0') +
                      '-' +
                      String(selectedDate.getDate()).padStart(2, '0');

                    if (facility) {
                      router.push({ pathname: '/book-slot', query: { facilityId: facility, date: dateStr } });
                    } else {
                      router.push({ pathname: '/book-slot', query: { date: dateStr } });
                    }

                    loadSlots(facility, selectedDate).catch((err) => {
                      console.error('Failed to load slots:', err);
                      setSlots([]);
                    });
                  }}
                  error={errors.date}
                  disablePastDates={true}
                />

              </div>
              {isAdmin && (
                <div className="mb-3">
                  <SelectInput
                    label="Select Employee"
                    value={selectedEmployee}
                    required
                    options={employeeOptions}
                    onChange={(val) => {
                      setSelectedEmployee(val);
                      setErrors((prev) => ({ ...prev, selectedEmployee: !val }));
                    }}
                    onSearch={handleEmployeeSearch}
                    isLoading={employeeLoading}
                    isClearable={true}
                    disabled={false}
                    error={errors.selectedEmployee}
                    showAvatar={true}
                  />
                  {errors.selectedEmployee && <small className="text-danger">Employee is required</small>}
                </div>
              )}
            </div>

            <div className="col-md-6 col-lg-6 col-sm-12">
              <div className="card premium-card mb-3 shadow">
                <div className="card-header premium-header d-flex justify-content-between align-items-center">
                  <h6 className="card-title m-0 fw-bold">{facility ? 'Slot Availability' : 'Slots'}</h6>
                  {date && <span className="header-meta  fw-bold ">{formatDisplayDate(date)}</span>}
                </div>

                <div className="card-body premium-body rounded-2" style={{ minHeight: '250px' }}>
                  {loadingSlots && <SlotSkeleton />}

                  {!loadingSlots && slots.length === 0 && <NoSlotsAvailable />}

                  {!loadingSlots && slots.length > 0 && (
                    <div className="d-flex flex-wrap">
                      {slots.map((slot, idx) => {
                        const isBooked = bookedSlots.includes(idx);
                        return (
                          <SlotChip
                            key={idx}
                            title={`Slot ${idx + 1}`}
                            startTime={`${slot.slotStartTime}`}
                            endTime={`${slot.slotEndTime}`}
                            reserved={isBooked}
                            gradientColor="linear-gradient(135deg, #8f4de5ff, #4a76efff)"
                            isSelected={selectedSlotIndex === idx}
                            onClick={() => {
                              if (!isBooked) setSelectedSlotIndex(idx);
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="premium-footer text-end">
          <Button label={loading ? 'Booking...' : 'Book Slot'} variant="primary" loading={loading} onClick={handleSubmit} icon="bi-calendar" />
        </div>
      </div>
    </div>
  );
}
