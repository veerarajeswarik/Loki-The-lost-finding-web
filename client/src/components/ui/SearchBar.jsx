import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search…', className = '', ...props }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/60" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-full border border-hairline bg-surface py-2.5 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-accent focus:ring-4 focus:ring-accent/10"
        {...props}
      />
    </div>
  );
}
