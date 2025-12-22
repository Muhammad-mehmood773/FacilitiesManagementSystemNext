import React from "react";

type OptionType = {
  value: string | number;
  label: string;
  avatar?: string;
  departmentName?: string;
};

type SelectInputProps = {
  label?: string;
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  options: OptionType[];
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
  onSearch?: (keyword: string) => void; 
  isLoading?: boolean;
  isClearable?: boolean;
  showAvatar?: boolean; 
};

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  error = false,
  required = false,
  onSearch,
  isLoading = false,
  isClearable = true,
}) => {
  return (
    <div>
      {label && (
        <label className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      {/* Optional search input (client-side enhancement only) */}
      {onSearch && (
        <input
          type="text"
          className="form-control mb-1"
          placeholder="Search..."
          onChange={(e) => onSearch(e.target.value)}
        />
      )}

      <select
        className={`form-select ${error ? "is-invalid" : ""}`}
        disabled={disabled || isLoading}
        value={value ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === "" ? null : isNaN(Number(val)) ? val : Number(val));
        }}
      >
        {isClearable && <option value="">-- Select --</option>}

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
            {opt.departmentName ? ` (${opt.departmentName})` : ""}
          </option>
        ))}
      </select>

      {error && (
        <div className="invalid-feedback d-block">
          This field is required
        </div>
      )}
    </div>
  );
};

export default SelectInput;
