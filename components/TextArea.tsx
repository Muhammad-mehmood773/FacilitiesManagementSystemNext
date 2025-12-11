import React from 'react';

type TextareaProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
};

const Textarea: React.FC<TextareaProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Enter text',
  disabled = false,
  rows = 4,
  maxLength,
}) => {
  return (
    <div className="mb-3 w-100 textarea-container">
      {label && <label className="form-label">{label}</label>}

      <textarea
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
      />

      {maxLength && (
        <small className="text-muted d-block text-end">
          {value.length}/{maxLength}
        </small>
      )}
    </div>
  );
};

export default Textarea;
