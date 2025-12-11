

type ButtonProps = {
  label: string;
  type?: 'button' | 'submit';
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  onClick?: () => void;
  icon?: string; // bootstrap icon class e.g. "bi-calendar"
};

const Button: React.FC<ButtonProps> = ({
  label,
  type = 'button',
  className,
  variant = 'primary',
  loading = false,
  onClick,
  icon,
}) => {
  const btnClass = className || `btn btn-${variant}`;

  return (
    <button type={type} className={btnClass} onClick={onClick} disabled={loading}>
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {label}
        </>
      ) : (
        <>
          {icon && <i className={`bi ${icon} me-2`}></i>}
          {label}
        </>
      )}
    </button>
  );
};

export default Button;
