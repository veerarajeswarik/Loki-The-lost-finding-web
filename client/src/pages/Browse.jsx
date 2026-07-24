import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PackageSearch, ChevronLeft, ChevronRight } from 'lucide-react';
import { useItems } from '../hooks/useItems.js';
import ItemCard from '../components/ItemCard.jsx';
import { GridSkeleton } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import { Select, Input } from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { CATEGORIES } from '../utils/constants.js';

export default function Browse() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    type: '',
    category: '',
    location: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setFilters((f) => ({ ...f, q, page: 1 }));
  }, [searchParams]);

  const { items, pagination, loading } = useItems(filters);
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium text-ink">Browse items</h1>
        <p className="text-sm text-ink-soft">Search lost and found reports across campus.</p>
      </div>

      <div className="mb-6 space-y-3 rounded-2xl bg-surface p-4 shadow-soft ring-1 ring-hairline">
        <SearchBar
          value={filters.q}
          onChange={(e) => set('q', e.target.value)}
          placeholder="Search title, description, or location…"
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Select value={filters.type} onChange={(e) => set('type', e.target.value)}>
            <option value="">All types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </Select>
          <Select value={filters.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <Input placeholder="Location" value={filters.location} onChange={(e) => set('location', e.target.value)} />
          <Input type="date" value={filters.dateFrom} onChange={(e) => set('dateFrom', e.target.value)} />
          <Input type="date" value={filters.dateTo} onChange={(e) => set('dateTo', e.target.value)} />
        </div>
      </div>

      {loading ? (
        <GridSkeleton count={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No items match your search"
          subtitle="Try adjusting the filters, or report a new item."
          actionLabel="Report an item"
          actionTo="/report/lost"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <motion.div key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.03 }}>
                <ItemCard item={item} />
              </motion.div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                disabled={pagination.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              >
                Previous
              </Button>
              <span className="text-sm text-ink-soft">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                iconRight={ChevronRight}
                disabled={pagination.page >= pagination.pages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
