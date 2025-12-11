import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import 'bootstrap-icons/font/bootstrap-icons.css';
import type { MenuItem, SidebarProps } from '../interfaces/sidebar';

const Sidebar: React.FC<SidebarProps> = ({ roleId }) => {
  const router = useRouter();

  const [menuItems] = useState<MenuItem[]>([
    { label: 'Book Slot', link: '/book-slot', icon: 'bi bi-house me-2' },
    { label: 'Create Slot', link: '/create-slot', icon: 'bi bi-house me-2' },
    { label: 'History', link: '/history', icon: 'bi bi-card-checklist me-2' },
  ]);

  const canShowMenu = (item: MenuItem) => {
    if (item.label === 'Create Slot') return roleId === 'Super Admin';
    return true;
  };

  return (
    <div className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <a className="logo logo-normal">
          <img src="/assets/logo.png" alt="Logo" />
        </a>
        <a className="logo-small">
          <img src="/assets/star1.png" />
        </a>
        <a className="dark-logo">
          <img src="/assets/star2.png" alt="Logo" />
        </a>
      </div>

      <div className="sidebar-inner slimscroll">
        <div className="sidebar-menu">
          <div className="profile-wrap">
            <div className="sidemenu">
              <ul className="sidebar-list">
                {menuItems.map((item, index) =>
                  canShowMenu(item) ? (
                    <li className="nav-item" key={index}>
                      <Link
                        href={item.link}
                        title={item.label}
                        className={`nav-link ${router.pathname === item.link ? 'active' : ''}`}
                      >
                        <i className={item.icon}></i>
                        <span style={{ marginLeft: '4px' }}>
                          {item.label === 'History' && roleId === 'Super Admin' ? 'Reservations' : item.label}
                        </span>
                      </Link>
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
