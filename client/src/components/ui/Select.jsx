export default function Select({ label, id, options, error, className = '', required = false, ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <select
        id={id}
        className={error ? 'input-error' : 'input'}
        aria-invalid={!!error}
        {...props}
      >
        {options.map((opt) =>
          typeof opt === 'string' ? (
            <option key={opt} value={opt}>{opt}</option>
          ) : (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          )
        )}
      </select>
      {error && (
        <p className="text-xs text-danger mt-1" role="alert">{error}</p>
      )}
    </div>
  );
}
