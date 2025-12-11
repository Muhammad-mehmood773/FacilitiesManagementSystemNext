import React from 'react';
import DatePicker from 'react-datepicker';

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
  return (
    <div className="mb-3">
      {label && (
        <label className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <DatePicker
        selected={value}
        onChange={onChange}
        className={`form-control ${error ? 'border-danger' : ''}`}
        disabled={disabled}
        placeholderText={placeholder}
        dateFormat="MMM d, yyyy"
        isClearable
        minDate={disablePastDates ? new Date() : undefined}
      />

      {error && <small className="text-danger">This field is required</small>}
    </div>
  );
};

export default DateInput;
