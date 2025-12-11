import React from 'react';

const UnauthorizedPage: React.FC = () => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ height: '100vh', width: '100%', textAlign: 'center', backgroundColor: '#f8f9fa' }}
    >
      <div className="p-4 rounded shadow-sm" style={{ background: '#fff', maxWidth: '650px', width: '100%' }}>
        <i className="bi bi-shield-lock-fill" style={{ fontSize: '8rem', color: '#ff6b35' }}></i>
        <h2 className="mt-1 fw-bold">Oops, Sorry!</h2>
        <h4 className="text-danger fw-semibold">Unauthorized Access</h4>
        <p className="text-muted fw-bold mt-2 mb-0">You don't have permission to view this page.</p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
