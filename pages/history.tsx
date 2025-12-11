import React, { useCallback, useEffect, useMemo, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useLayoutContext } from '../context/LayoutContext';
import { FacilitySlotService } from '../services/FacilitySlot';
import type { SlotItem } from '../interfaces/slotHistoryResponse';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import type { CancelSlotPayload } from '../interfaces/SlotCancel';

export default function HistoryPage() {
  return (
    <MainLayout>
      <History />
    </MainLayout>
  );
}

function History() {
  const { roleId } = useLayoutContext();
  const [history, setHistory] = useState<SlotItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const employeeId = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('loginId') || '' : ''), []);
  const pageSize = 48;
  const router = useRouter();

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`;
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const formatTime = (time: string | undefined) => {
    if (!time) return '';
    const [hoursStr, minutesStr] = time.split(':');
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
  };

  const loadData = useCallback(
    (page: number) => {
      const filters = {
        pageNumber: page,
        pageSize,
        employeeId: employeeId,
        startDate: startDate || today,
        endDate: endDate || today,
      };

      FacilitySlotService.getHistory(filters)
        .then((res) => {
          const list = Array.isArray(res.data.data) ? res.data.data : [];
          if (list.length === 0) {
            setHistory([]);
            setTotalPages(1);
            return;
          }
          const sorted = list.slice().sort((a, b) => {
            const da = new Date(a.slotDate).getTime();
            const db = new Date(b.slotDate).getTime();
            if (da !== db) return da - db;
            return (a.startTime || '').localeCompare(b.startTime || '');
          });
          setHistory(sorted);
          setTotalPages(res.data.paginatedResponse.totalPages);
        })
        .catch(console.error);
    },
    [employeeId, pageSize, startDate, endDate, today]
  );

  const getSlotStartDateTime = (slot: SlotItem) => new Date(`${slot.slotDate}T${slot.startTime}`);

  const canCancel = (slot: SlotItem) => {
    const slotStart = getSlotStartDateTime(slot);
    const now = new Date();
    if (roleId === 'Super Admin') return slot.facilitySlotStatusName === 'Reserved';
    const diffMinutes = (slotStart.getTime() - now.getTime()) / (1000 * 60);
    return slot.facilitySlotStatusName === 'Reserved' && diffMinutes > 15;
  };

  const canBook = (slot: SlotItem) => {
    const slotStart = getSlotStartDateTime(slot);
    const now = new Date();
    if (roleId === 'Super Admin') {
      return (slot.facilitySlotStatusName === 'Cancelled' || slot.facilitySlotStatusName === 'Available') && slotStart > now;
    }
    return slot.facilitySlotStatusName === 'Available' && slotStart > now;
  };

  useEffect(() => {
    document.title = 'History';
    loadData(currentPage);
  }, [currentPage, loadData]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Available':
        return 'badge badge-success-transparent';
      case 'Reserved':
        return 'badge badge-warning-transparent';
      case 'In-Progress':
        return 'badge badge-info-transparent';
      case 'Completed':
        return 'badge badge-primary';
      case 'Cancelled':
        return 'badge badge-danger-transparent';
      default:
        return 'badge badge-secondary-transparent';
    }
  };

  const handleCancel = async (slot: SlotItem) => {
    try {
      const payload: CancelSlotPayload = { slotId: slot.slotId, employeeId: slot.employeeId };
      const res = await FacilitySlotService.cancelSlots(payload);
      if (res.success) {
        toast.success('Slot cancelled successfully!');
        loadData(currentPage);
      } else {
        alert(res.message || 'Failed to cancel slot');
      }
    } catch (err) {
      console.log(err);
      toast.error('Something went wrong while cancelling slot');
    }
  };

  const goToBookSlot = (slot: SlotItem) => {
    const prefill = {
      facilityName: slot.facilityName,
      resourceName: slot.facilityResourceName,
      slotId: slot.slotId,
      slotDate: slot.slotDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
    };
    router.push({ pathname: '/book-slot', query: { prefill: encodeURIComponent(JSON.stringify(prefill)) } });
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="row">
          <div className="card px-0">
            <div className="card-header bg-transparent">
              <div className="d-flex justify-content-between align-items-center flex-wrap w-100">
                <h5 className="fw-bold mb-0">{roleId === 'Super Admin' ? 'Slots' : 'History'}</h5>

                <div className="d-flex gap-3 flex-wrap align-items-end">
                  <div>
                    <label className="form-label mb-1" style={{ fontSize: '14px', color: '#6b7280' }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="form-control date-filter-input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label mb-1" style={{ fontSize: '14px', color: '#6b7280' }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      className="form-control date-filter-input"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value < startDate) setEndDate(startDate);
                        else setEndDate(value);
                      }}
                    />
                  </div>

                  <div>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        if (endDate < startDate) {
                          toast.error('End date must be same or greater than start date');
                          return;
                        }
                        setHistory([]);
                        setCurrentPage(1);
                        loadData(1);
                      }}
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body p-0 msh-cardBody of-table">
              {history.length === 0 ? (
                <div className="text-center text-muted my-5">No history found.</div>
              ) : (
                <>
                  <table className="table table-responsive my-ticket-table">
                    <thead className="thead-light">
                      <tr>
                        <th>Facility</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Employee</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((slot) => (
                        <tr key={slot.slotId}>
                          <td>{slot.facilityName}</td>
                          <td>{slot.slotDate}</td>
                          <td>
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </td>
                          <td>
                            {slot.employeeName || slot.employeePhoto ? (
                              <div className="d-flex align-items-center">
                                {slot.employeePhoto ? (
                                  <img
                                    src={slot.employeePhoto}
                                    alt={slot.employeeName || 'User'}
                                    className="rounded-circle"
                                    width={35}
                                    height={35}
                                    style={{ objectFit: 'cover', marginRight: '8px' }}
                                  />
                                ) : null}
                                {slot.employeeName ? <span>{slot.employeeName}</span> : null}
                              </div>
                            ) : null}
                          </td>
                          <td>
                            <span className={getStatusClass(slot.facilitySlotStatusName)}>{slot.facilitySlotStatusName}</span>
                          </td>
                          <td>
                            {canBook(slot) && (
                              <button className="btn btn-primary btn-sm me-2" onClick={() => goToBookSlot(slot)}>
                                Book Slot
                              </button>
                            )}
                            {canCancel(slot) && (
                              <button className="btn btn-danger btn-sm" onClick={() => handleCancel(slot)}>
                                Cancel Slot
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <nav className="d-flex justify-content-center my-3">
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => goToPage(currentPage - 1)}>
                          &lt;
                        </button>
                      </li>

                      {Array.from({ length: totalPages }).map((_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => goToPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}

                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => goToPage(currentPage + 1)}>
                          Next &gt;
                        </button>
                      </li>
                    </ul>
                  </nav>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
