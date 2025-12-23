import React, { useMemo } from 'react';

type TimeInputProps = {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
  placeholder?: string;
  interval?: number;
};

const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  error = false,
  required = false,
  placeholder = 'Select time',
  interval = 30,
}) => {
  const inputClassName = useMemo(() => `form-control ${error ? 'border-danger' : ''}`, [error]);

  const inputValue = useMemo(() => {
    if (!value) return '';
    const hh = String(value.getHours()).padStart(2, '0');
    const mm = String(value.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }, [value]);

  const stepValue = useMemo(() => {
    const safeInterval = typeof interval === 'number' && interval > 0 ? interval : 30;
    return String(safeInterval * 60);
  }, [interval]);

  return (
    <div className="mb-3">
      {label && (
        <label className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="position-relative">
        <input
          type="time"
          className={`${inputClassName} fms-input-with-arrow fms-time-input`}
          disabled={disabled}
          placeholder={placeholder}
          value={inputValue}
          step={stepValue}
          onChange={(e) => {
            const raw = e.target.value;
            if (!raw) {
              onChange(null);
              return;
            }

            const [h, m] = raw.split(':');
            const hours = Number(h);
            const minutes = Number(m);
            if (Number.isNaN(hours) || Number.isNaN(minutes)) {
              onChange(null);
              return;
            }

            const base = value ? new Date(value) : new Date();
            base.setSeconds(0, 0);
            base.setHours(hours, minutes, 0, 0);
            onChange(base);
          }}
        />
        <span className="position-absolute top-50 end-0 translate-middle-y pe-3 fms-input-arrow" aria-hidden="true">
          ▼
        </span>
      </div>

      <style jsx>{`
        .fms-input-with-arrow {
          padding-right: 2rem;
        }

        .fms-input-arrow {
          pointer-events: none;
          color: inherit;
          opacity: 0.7;
          font-size: 0.8rem;
          line-height: 1;
        }

        .fms-time-input::-webkit-calendar-picker-indicator {
          opacity: 0;
          display: block;
          position: absolute;
          right: 0;
          width: 2rem;
          height: 100%;
          cursor: pointer;
        }
      `}</style>

      {error && <small className="text-danger">This field is required</small>}
    </div>
  );
};

export default TimeInput;
