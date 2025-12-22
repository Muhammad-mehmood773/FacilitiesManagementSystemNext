import React, { useEffect, useState } from 'react';

type SlotChipProps = {
  title: string;
  startTime: string;
  endTime: string;
  gradientColor?: string;
  selectedColor?: string;
  onClick?: () => void;
  reserved?: boolean;
  isSelected?: boolean;
};

const SlotChip: React.FC<SlotChipProps> = ({
  title,
  startTime,
  endTime,
  gradientColor = 'linear-gradient(135deg, #a0d8ff, #ffffff)',
  selectedColor = 'linear-gradient(135deg, #7ab8ff, #4a90e2)',
  onClick,
  reserved = false,
  isSelected = false,
}) => {
  const [hover, setHover] = useState(false);

  const getResponsiveWidth = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 480) return '100%';
      if (window.innerWidth < 768) return 'calc(50% - 12px)';
      if (window.innerWidth < 1654) return 'calc(33.33% - 12px)';
    }
    return 'calc(25% - 12px)';
  };

  const [responsiveWidth, setResponsiveWidth] = useState<string>('calc(25% - 12px)');

  useEffect(() => {
    const update = () => setResponsiveWidth(getResponsiveWidth());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const formatTime12 = (time24: string) => {
    const [hourStr, minuteStr] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const chipStyle: React.CSSProperties = {
    background: reserved ? 'linear-gradient(135deg, #e0e0e0, #f5f5f5)' : isSelected ? selectedColor : gradientColor,
    color: '#fff',
    padding: '5px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    cursor: reserved ? 'not-allowed' : 'pointer',
    margin: '6px',
    fontSize: '12px',
    fontWeight: 600,
    width: responsiveWidth,
    position: 'relative',
    boxShadow: hover && !reserved ? '0 4px 8px rgba(0,0,0,0.15)' : reserved ? 'inset 0 0 6px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.1)',
    transform: hover && !reserved ? 'translateY(-2px)' : 'translateY(0)',
    transition: 'all 0.3s ease',
    height: '94px',
  };

  return (
    <div
      onClick={() => !reserved && onClick?.()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={chipStyle}
    >
      <div style={{ color: reserved ? '#000' : '#fff', fontSize: '15px' }}>{title}</div>

      <small style={{ color: reserved ? '#000' : '#fff', fontSize: '15px' }}>{`${formatTime12(startTime)} - ${formatTime12(endTime)}`}</small>

      <small
        style={{
          fontSize: '15px',
          marginTop: '2px',
          opacity: 0.9,
          fontWeight: 600,
          letterSpacing: '0.3px',
          color: reserved || isSelected ? '#ff0404ff' : '#fff',
        }}
      >
        {reserved || isSelected ? 'Selected' : 'Available'}
      </small>

      {(reserved || isSelected) && (
        <span
          style={{
            position: 'absolute',
            bottom: '-6px',
            right: '6px',
            width: '18px',
            height: '18px',
            background: reserved ? '#ff4d4f' : '#fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 'bold',
            color: reserved ? '#fff' : '#000',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          ✓
        </span>
      )}
    </div>
  );
};

export default SlotChip;
