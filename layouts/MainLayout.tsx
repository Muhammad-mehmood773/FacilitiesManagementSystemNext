import React, { useEffect, useState, type PropsWithChildren } from 'react';
import { useRouter } from 'next/router';
import { FacilityEmployeeService } from '../services/FacilityEmployeeService';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import { LayoutContext } from '../context/LayoutContext';

const MainLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
  const [roleId, setRoleName] = useState('');

  const router = useRouter();

  useEffect(() => {
    const employeeId = typeof window !== 'undefined' ? localStorage.getItem('loginId') : null;

    if (!employeeId) {
      router.push('/unauthorized');
      return;
    }

    FacilityEmployeeService.getEmployeeById(Number(employeeId))
      .then((res) => {
        const response = res?.data;

        if (!response?.success || !response?.data) {
          router.push('/unauthorized');
          return;
        }

        const data = response.data;

        setUserName(data.fullName);
        setUserPhoto(data.employeePhoto);
        setRoleName(data.facilityRoleName);

        if (data.facilityRoleId !== 1 && data.facilityRoleId !== 2) {
          router.push('/unauthorized');
        }
      })
      .catch(() => {
        router.push('/unauthorized');
      });
  }, [router]);

  return (
    <section className="dashboard-sec" style={{ background: '#f1f4fa' }}>
      <div className="flex-row">
        <div className="js-sidemenu cols-left expanded">
          <Sidebar roleId={roleId} />
        </div>

        <div className="cols-right ">
          <div className="top-area ">
            <Header userName={userName} userPhoto={userPhoto} />
          </div>

          <div className="flex-row custom me-2 p-2 h-100">
            <div className="cols-1">
              <div className="info-wrap mb-5">
                <LayoutContext.Provider value={{ roleId }}>
                  {children}
                </LayoutContext.Provider>
             
              </div>
            </div>
          </div>

             <div className="row mb-5"></div>
                <div className="row mb-5"></div>
                <div className="row mb-5"></div>
                <div className="row mb-5"></div>
                <div className="row mb-5"></div>
                <div className="row mb-5"></div>
       
        </div>
      </div>
    </section>
  );
};

export default MainLayout;
