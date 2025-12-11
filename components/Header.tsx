import React, { useState, useRef, useEffect } from 'react';
import { HeaderProps } from '../interfaces/header';

const Header: React.FC<HeaderProps> = ({ userName, userPhoto }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <div className="header-container shadow">
      <div className="header-left-group">
        {/* <i className="bi bi-arrow-left header-back-icon" onClick={onBack}></i> */}

        <div className="header-search-box">
          <i className="bi bi-search search-icon"></i>
          <input type="text" className="header-search-input" placeholder="Search..." />
          <span className="search-shortcut">CTRL + /</span>
        </div>
      </div>

      <div className="header-avatar-wrapper" ref={dropdownRef}>
        <div className="header-avatar" onClick={() => setOpen(!open)} style={{ position: 'relative', display: 'inline-block' }}>
          {userPhoto ? (
            <>
              <img src={userPhoto} alt="profile" className="avatar-img" />
              <span aria-hidden="true" className="loggedIn-dot" />
            </>
          ) : (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {userName?.charAt(0).toUpperCase()}
              <span aria-hidden="true" className="loggedIn-dot" />
            </div>
          )}
        </div>

        {open && (
          <div className="header-dropdown">
            <div className="dropdown-user-info">
              <div className="dropdown-avatar">
                <span className="avatar avatar-sm online" style={{ position: 'relative', display: 'inline-block' }}>
                  {userPhoto ? (
                    <img src={userPhoto} alt="profile" className="avatar-img" />
                  ) : (
                    <img
                      src="https://hr.astrikdigital.com/employeeimages/user.png"
                      alt="default"
                      className="img-fluid rounded-circle"
                    />
                  )}
                  <span aria-hidden="true" className="loggedIn-dot" />
                </span>
              </div>
              <small className="dropdown-name ft-12px ">{userName}</small>
            </div>
          </div>
        )}
        <small className="mx-2 dropdown-name ">{userName}</small>
      </div>
    </div>
  );
};

export default Header;
