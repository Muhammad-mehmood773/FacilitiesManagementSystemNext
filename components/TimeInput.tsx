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

      <input
        type="time"
        className={inputClassName}
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

      {error && <small className="text-danger">This field is required</small>}
    </div>
  );
};

export default TimeInput;
