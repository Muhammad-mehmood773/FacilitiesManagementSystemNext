import React, { type PropsWithChildren } from 'react';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import { LayoutContext } from '../context/LayoutContext';

type MainLayoutProps = PropsWithChildren<{
  userName: string;
  userPhoto: string;
  roleId: string;
}>;

const MainLayout: React.FC<MainLayoutProps> = ({ children, userName, userPhoto, roleId }) => {

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
