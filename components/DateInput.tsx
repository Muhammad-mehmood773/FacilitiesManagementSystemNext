import React, { useEffect, useMemo, useState } from 'react';

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
  const [mounted, setMounted] = useState(false);
  const [DatePicker, setDatePicker] = useState<null | React.ComponentType<any>>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    (async () => {
      const mod = await import('react-datepicker');
      if (!cancelled) setDatePicker(() => (mod as any).default);
    })();
    return () => {
      cancelled = true;
    };
  }, [mounted]);

  const inputClassName = useMemo(() => `form-control ${error ? 'border-danger' : ''}`, [error]);

  return (
    <div className="mb-3">
      {label && (
        <label className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      {mounted && DatePicker ? (
        <DatePicker
          selected={value}
          onChange={onChange}
          className={inputClassName}
          disabled={disabled}
          placeholderText={placeholder}
          dateFormat="MMM d, yyyy"
          isClearable
          minDate={disablePastDates ? new Date() : undefined}
        />
      ) : (
        <input
          type="text"
          className={inputClassName}
          disabled={disabled}
          placeholder={placeholder}
          readOnly
          value=""
        />
      )}

      {error && <small className="text-danger">This field is required</small>}
    </div>
  );
};

export default DateInput;
