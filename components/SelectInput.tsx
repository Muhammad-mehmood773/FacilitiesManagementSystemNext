"use client";

import React from "react";
import Select, { SingleValue } from "react-select";

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
  showAvatar = false,
}) => {
  const selectedOption =
    options.find((opt) => opt.value === value) || null;

  return (
    <div>
      {label && (
        <label className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <Select
        options={options}
        value={selectedOption}
        onChange={(opt: SingleValue<OptionType>) =>
          onChange(opt ? opt.value : null)
        }
        isDisabled={disabled}
        isClearable={isClearable}
        isLoading={isLoading}
        onInputChange={(input) => {
          onSearch?.(input);
          return input;
        }}
        formatOptionLabel={(option) =>
          showAvatar ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {option.avatar && (
                <img
                  src={option.avatar}
                  alt={option.label}
                  style={{ width: 30, height: 30, borderRadius: "50%" }}
                />
              )}
              <div>
                <div>{option.label}</div>
                {option.departmentName && (
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {option.departmentName}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div>{option.label}</div>
              {option.departmentName && (
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {option.departmentName}
                </div>
              )}
            </div>
          )
        }
        styles={{
          control: (base, state) => ({
            ...base,
            borderColor: error ? "red" : base.borderColor,
            boxShadow: state.isFocused
              ? error
                ? "0 0 0 1px red"
                : base.boxShadow
              : "none",
            "&:hover": {
              borderColor: error ? "red" : base.borderColor,
            },
          }),
        }}
      />
    </div>
  );
};

export default SelectInput;
