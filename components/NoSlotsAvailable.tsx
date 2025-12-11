import React from 'react';

type NoSlotsAvailableProps = {
  message?: string;
};

const NoSlotsAvailable: React.FC<NoSlotsAvailableProps> = ({ message = 'No slots available' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '150px',
        border: '3px dashed #ced4da',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
        color: '#8f9299ff',
        gap: '10px',
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#f26522" className="bi bi-calendar-x" viewBox="0 0 16 16">
        <path d="M4 .5a.5.5 0 0 1 .5.5v1h6V1a.5.5 0 0 1 1 0v1h1a2 2 0 0 1 2 2v1H1V3a2 2 0 0 1 2-2h1V1a.5.5 0 0 1 .5-.5zM1 14V5h14v9a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2z" />
        <path d="M6.146 9.354a.5.5 0 0 0 .708 0L8 8.207l1.146 1.147a.5.5 0 0 0 .708-.708L8.707 7.5l1.147-1.146a.5.5 0 0 0-.708-.708L8 6.793 6.854 5.646a.5.5 0 1 0-.708.708L7.293 7.5 6.146 8.646a.5.5 0 0 0 0 .708z" />
      </svg>
      <span style={{ fontSize: '16px', fontWeight: 500 }}>{message}</span>
    </div>
  );
};

export default NoSlotsAvailable;
