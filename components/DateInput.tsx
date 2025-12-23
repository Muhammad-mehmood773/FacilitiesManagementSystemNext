import React, { useMemo } from 'react';

type DateInputProps = {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
  placeholder?: string;
  disablePastDates?: boolean;
};

const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  error = false,
  required = false,
  placeholder = 'Select date',
  disablePastDates = false,
}) => {
  const inputClassName = useMemo(() => `form-control ${error ? 'border-danger' : ''}`, [error]);

  const inputValue = useMemo(() => {
    if (!value) return '';
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [value]);

  const minValue = useMemo(() => {
    if (!disablePastDates) return undefined;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [disablePastDates]);

  return (
    <div className="mb-3">
      {label && (
        <label className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="position-relative">
        <input
          type="date"
          className={`${inputClassName} fms-input-with-arrow fms-date-input`}
          disabled={disabled}
          placeholder={placeholder}
          value={inputValue}
          min={minValue}
          onChange={(e) => {
            const raw = e.target.value;
            if (!raw) {
              onChange(null);
              return;
            }

            const parsed = new Date(`${raw}T00:00:00`);
            if (Number.isNaN(parsed.getTime())) {
              onChange(null);
              return;
            }
            onChange(parsed);
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

        .fms-date-input::-webkit-calendar-picker-indicator {
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

export default DateInput;
