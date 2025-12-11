import React, { useEffect, useMemo, useState } from 'react';
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

export default function BookSlotPage() {
  return (
    <MainLayout>
      <BookSlot />
    </MainLayout>
  );
}

function BookSlot() {
  const [facility, setFacility] = useState<string | number>('');
  const [tableField, setTableField] = useState<string | number>('');
  const [date, setDate] = useState<Date | null>(null);

  type OptionType = { label: string; value: string | number };

  const [facilityOptions, setFacilityOptions] = useState<OptionType[]>([]);
  const [tableOptions, setTableOptions] = useState<OptionType[]>([]);

  const [loadingFacilities, setLoadingFacilities] = useState(true);
  const [loadingResources, setLoadingResources] = useState(false);

  const [slots, setSlots] = useState<FacilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const { roleId } = useLayoutContext();
  const isAdmin = roleId === 'Super Admin';

  const [selectedEmployee, setSelectedEmployee] = useState<string | number>('');
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
    setLoadingFacilities(true);
    document.title = 'Book Slot';
    FacilityService.getFacilities()
      .then((res) => {
        const slots = res.data || [];
        const dropdown = slots.map((f) => ({ label: f.facilityName, value: f.facilityId }));

        setFacilityOptions(dropdown);
        const defaultFacility = dropdown[0];
        if (defaultFacility) {
          setFacility(defaultFacility.value);
          setLoadingResources(true);
          FacilityService.getFacilitiesResources(Number(defaultFacility.value))
            .then((res2) => {
              const facilities = res2.data || [];
              const tableDropdown = facilities.map((t) => ({
                label: t.facilityResourceName,
                value: t.facilityResourceId,
              }));
              setTableOptions(tableDropdown);
              const defaultTable = tableDropdown[0];
              if (defaultTable) setTableField(defaultTable.value);
            })
            .finally(() => setLoadingResources(false));
        }
        const today = new Date();
        setDate(today);
        if (defaultFacility) loadSlots(defaultFacility.value, today);
      })
      .finally(() => setLoadingFacilities(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFacilityChange = (value: string | number) => {
    setFacility(value);
    setErrors((prev) => ({ ...prev, facility: !value }));

    setTableField('');
    setTableOptions([]);

    if (!value) {
      setSlots([]);
      return;
    }

    setLoadingResources(true);
    FacilityService.getFacilitiesResources(Number(value))
      .then((res) => {
        const tables = res.data || [];
        const dropdown = [
          { label: 'Select Table', value: '' },
          ...tables.map((t) => ({ label: t.facilityResourceName, value: t.facilityResourceId })),
        ];
        setTableOptions(dropdown);
      })
      .finally(() => setLoadingResources(false));

    if (date) loadSlots(value, date);
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
        employeeId: isAdmin ? Number(selectedEmployee) : Number(localStorage.getItem('loginId')),
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
                    if (selectedDate) loadSlots(facility, selectedDate);
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
