import React from 'react';

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
};

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  const checkboxId = `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="form-check mt-3">
      <input id={checkboxId} className="form-check-input" type="checkbox" checked={checked} onChange={onChange} />
      <label className="form-check-label" htmlFor={checkboxId}>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
