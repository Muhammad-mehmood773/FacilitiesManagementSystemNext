import React, { useEffect, useState } from 'react';
import type { GetServerSideProps } from 'next';
import MainLayout from '../layouts/MainLayout';
import { useLayoutContext } from '../context/LayoutContext';
import { FacilitySlotService } from '../services/FacilitySlot';
import type { SlotItem } from '../interfaces/slotHistoryResponse';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import type { CancelSlotPayload } from '../interfaces/SlotCancel';
import { requireEmployee } from '../utils/ssrAuth';
import { createServerApi } from '../api/serverApi';
import type { SlotHistoryResponse } from '../interfaces/slotHistoryResponse';

type PageProps = {
  userName: string;
  userPhoto: string;
  roleId: string;
  history: SlotItem[];
  currentPage: number;
  totalPages: number;
  startDate: string;
  endDate: string;
  requestPayload: {
    pageNumber: number;
    pageSize: number;
    employeeId: number;
    startDate: string;
    endDate: string;
  };
};

export default function HistoryPage({ userName, userPhoto, roleId, history, currentPage, totalPages, startDate, endDate, requestPayload }: PageProps) {
  return (
    <MainLayout userName={userName} userPhoto={userPhoto} roleId={roleId}>
      <History
        initialHistory={history}
        initialCurrentPage={currentPage}
        initialTotalPages={totalPages}
        initialStartDate={startDate}
        initialEndDate={endDate}
        employeeId={requestPayload.employeeId}
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

  const pageSize = 48;



  const pageRaw =
    typeof ctx.query.pageNumber === 'string'
      ? ctx.query.pageNumber
      : undefined;

  const currentPage = Math.max(1, Number(pageRaw || '1') || 1);
  const pageNumber = currentPage;

  const startDate = typeof ctx.query.startDate === 'string' ? ctx.query.startDate : '';
  const endDate = typeof ctx.query.endDate === 'string' ? ctx.query.endDate : '';
  const employeeId = Number(auth.loginId);
  const requestPayload: PageProps['requestPayload'] = {
    pageNumber,
    pageSize,
    employeeId,
    startDate,
    endDate,
  };
  let sorted: PageProps['history'] = [];
  let totalPages = 1;

  try {
    const api = createServerApi(auth.loginId);
    const historyRes = await api.get<SlotHistoryResponse>('FacilitySlot/get-all-facility-slot', {
      params: requestPayload,
    });

    const list = Array.isArray(historyRes.data?.data) ? historyRes.data.data : [];
    sorted = list.slice().sort((a, b) => {
      const da = new Date(a.slotDate).getTime();
      const db = new Date(b.slotDate).getTime();
      if (da !== db) return da - db;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });

    totalPages = historyRes.data?.paginatedResponse?.totalPages || 1;
  } catch {
    sorted = [];
    totalPages = 1;
  }

  return {
    props: {
      userName: auth.employee.fullName,
      userPhoto: auth.employee.employeePhoto,
      roleId: auth.employee.facilityRoleName,
      history: sorted,
      currentPage,
      totalPages,
      startDate,
      endDate,
      requestPayload,
    },
  };
};

function History({
  initialHistory,
  initialCurrentPage,
  initialTotalPages,
  initialStartDate,
  initialEndDate,
  employeeId,
}: {
  initialHistory: SlotItem[];
  initialCurrentPage: number;
  initialTotalPages: number;
  initialStartDate: string;
  initialEndDate: string;
  employeeId: number;
}) {
  const { roleId } = useLayoutContext();
  const [history, setHistory] = useState<SlotItem[]>(initialHistory);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const router = useRouter();

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`;
  const [startDate, setStartDate] = useState(initialStartDate || today);
  const [endDate, setEndDate] = useState(initialEndDate || today);

  const formatTime = (time: string | undefined) => {
    if (!time) return '';
    const [hoursStr, minutesStr] = time.split(':');
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
  };

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
  }, []);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchHistory(page);
  };



  const fetchHistory = async (page = 1) => {
    if (endDate < startDate) {
      toast.error('End date must be same or greater than start date');
      return;
    }

    try {
      const res = await FacilitySlotService.getHistory({
        employeeId,
        pageNumber: page,
        pageSize: 48,
        startDate,
        endDate,
      });

      setHistory(res.data.data || []);
      setCurrentPage(page);
      setTotalPages(res.data.paginatedResponse?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to fetch data');
    }
  };



  const applyFilter = () => {
    fetchHistory(1);
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
        router.replace(router.asPath);
      } else {
        alert(res.message || 'Failed to cancel slot');
      }
    } catch (err) {
      console.log(err);
      toast.error('Something went wrong while cancelling slot');
    }
  };


const goToBookSlot = (slot: SlotItem) => {
  router.push({
    pathname: '/book-slot',
    query: {
      slotId: String(slot.slotId),
      slotDate: slot.slotDate,
    },
  });
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
                      onClick={applyFilter}
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
