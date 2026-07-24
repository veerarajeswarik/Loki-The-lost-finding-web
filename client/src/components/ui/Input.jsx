import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const base =
  'w-full rounded-xl border border-hairline bg-surface text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:bg-black/[0.02] disabled:text-ink-soft';

function Field({ label, hint, error, required, children, id }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between">
          <span className="text-sm font-medium text-ink-soft">
            {label} {required && <span className="text-danger">*</span>}
          </span>
          {hint && <span className="text-xs text-ink-soft/70">{hint}</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

export const Input = forwardRef(function Input(
  { label, hint, error, required, icon: Icon, className = '', id, ...props },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id}>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/60" />
        )}
        <input
          id={id}
          ref={ref}
          className={`${base} px-3.5 py-2.5 ${Icon ? 'pl-10' : ''} ${error ? 'border-danger/50 focus:border-danger focus:ring-danger/10' : ''} ${className}`}
          {...props}
        />
      </div>
    </Field>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, hint, error, required, className = '', id, rows = 4, ...props },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id}>
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={`${base} resize-none px-3.5 py-3 ${error ? 'border-danger/50 focus:border-danger focus:ring-danger/10' : ''} ${className}`}
        {...props}
      />
    </Field>
  );
});

export const Select = forwardRef(function Select(
  { label, hint, error, required, className = '', id, children, ...props },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id}>
      <div className="relative">
        <select
          id={id}
          ref={ref}
          className={`${base} appearance-none px-3.5 py-2.5 pr-10 ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/60" />
      </div>
    </Field>
  );
});
