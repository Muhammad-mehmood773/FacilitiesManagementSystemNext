import React from 'react';
import DatePicker from 'react-datepicker';

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
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={interval}
        timeCaption="Time"
        dateFormat="h:mm aa"
        isClearable
      />

      {error && <small className="text-danger">This field is required</small>}
    </div>
  );
};

export default TimeInput;
