import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../services/api.js';

/**
 * Fetch items with filters + pagination. Pass a filters object; changing it
 * (stringified) re-fetches.
 */
export function useItems(filters = {}) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const key = JSON.stringify(filters);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v != null) params.append(k, v);
      });
      const data = await apiGet(`/items?${params.toString()}`);
      setItems(data.items || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, pagination, loading, error, refetch: fetchItems };
}
