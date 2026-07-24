export const CATEGORIES = [
  'electronics',
  'ID cards',
  'books',
  'accessories',
  'clothing',
  'keys',
  'other',
];

export const ITEM_TYPES = ['lost', 'found'];

export const STATUS_LABELS = {
  open: { text: 'Open', cls: 'bg-blue-100 text-blue-700' },
  matched: { text: 'Matched', cls: 'bg-amber-100 text-amber-700' },
  pending_verification: { text: 'Verifying', cls: 'bg-purple-100 text-purple-700' },
  recovered: { text: 'Recovered', cls: 'bg-brand-100 text-brand-700' },
  closed: { text: 'Closed', cls: 'bg-slate-100 text-slate-600' },
};

export const MATCH_STATUS_LABELS = {
  suggested: { text: 'Suggested', cls: 'bg-blue-100 text-blue-700' },
  accepted: { text: 'Accepted', cls: 'bg-amber-100 text-amber-700' },
  rejected: { text: 'Rejected', cls: 'bg-red-100 text-red-700' },
  verified: { text: 'Verified', cls: 'bg-purple-100 text-purple-700' },
  completed: { text: 'Completed', cls: 'bg-brand-100 text-brand-700' },
};

// Legacy emoji lookup — kept for not-yet-redesigned pages (e.g. Admin, phase 2).
export const CATEGORY_ICONS = {
  electronics: '💻',
  'ID cards': '🪪',
  books: '📚',
  accessories: '🎒',
  clothing: '👕',
  keys: '🔑',
  other: '📦',
};

export const ROLES = ['student', 'faculty', 'staff', 'security', 'admin'];

// ── Redesigned-page metadata (Badge `tone` + lucide icon key) ──────────
// Icon components are resolved where used (via CATEGORY_ICON_KEYS →
// lucide-react imports) to avoid bundling icon refs inside plain data.
export const STATUS_META = {
  open: { label: 'Open', tone: 'info' },
  matched: { label: 'Matched', tone: 'warning' },
  pending_verification: { label: 'Verifying', tone: 'accent' },
  recovered: { label: 'Recovered', tone: 'success' },
  closed: { label: 'Closed', tone: 'neutral' },
};

export const MATCH_STATUS_META = {
  suggested: { label: 'Suggested', tone: 'info' },
  accepted: { label: 'Accepted', tone: 'warning' },
  rejected: { label: 'Rejected', tone: 'danger' },
  verified: { label: 'Verified', tone: 'accent' },
  completed: { label: 'Completed', tone: 'success' },
};

