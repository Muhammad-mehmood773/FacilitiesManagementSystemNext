import React from 'react';

const SlotSkeleton: React.FC = () => {
  const placeholders = Array.from({ length: 16 });

  return (
    <div className="d-flex flex-wrap">
      {placeholders.map((_, idx) => (
        <div key={idx} className="slot-skeleton-chip"></div>
      ))}
    </div>
  );
};

export default SlotSkeleton;
