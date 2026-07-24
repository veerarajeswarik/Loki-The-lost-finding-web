import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiPatch, apiPost } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { LineSkeleton } from '../components/Skeleton.jsx';
import { StatusBadge, TypeBadge } from '../components/Badges.jsx';
import { STATUS_LABELS } from '../utils/constants.js';
import { formatDate } from '../utils/format.js';

const STATUSES = Object.keys(STATUS_LABELS);

export default function Admin() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', status: '', q: '' });

  const loadItems = useCallback(async () => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([k, v]) => v && params.append(k, v));
    const data = await apiGet(`/admin/items?${params.toString()}`);
    setItems(data.items || []);
  }, [filter]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        apiGet('/admin/stats'),
        apiGet('/admin/verifications'),
      ]);
      setStats(s);
      setReviews(r || []);
      await loadItems();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadItems]);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadItems().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const setStatus = async (id, status) => {
    try {
      await apiPatch(`/admin/items/${id}/status`, { status });
      setItems((list) => list.map((it) => (it._id === id ? { ...it, status } : it)));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const review = async (verificationId, decision) => {
    try {
      await apiPost(`/verifications/${verificationId}/review`, { decision });
      toast.success(`Verification ${decision}`);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <LineSkeleton rows={8} />;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">🛡️ Admin dashboard</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Items" value={stats.items.total} />
          <Stat label="Lost" value={stats.items.lost} />
          <Stat label="Found" value={stats.items.found} />
          <Stat label="Recovered" value={stats.items.recovered} accent />
          <Stat label="Users" value={stats.users} />
          <Stat label="Recovery %" value={`${stats.recoveryRate}%`} accent />
        </div>
      )}

      {/* Pending reviews */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">
          Pending verification reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400">No pending reviews. 🎉</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="card flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-800">
                    {r.claimant?.name || 'Claimant'} · AI score {r.aiScore ?? '—'}%
                  </p>
                  <p className="text-xs text-slate-500">{r.aiFeedback}</p>
                  {r.match && (
                    <Link to={`/matches/${r.match._id || r.match}`} className="text-xs text-brand-600 hover:underline">
                      View match →
                    </Link>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => review(r._id, 'approved')} className="btn-primary">Approve</button>
                  <button onClick={() => review(r._id, 'rejected')} className="btn-danger">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Items table */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">All items</h2>
          <div className="flex gap-2">
            <input
              className="input w-40"
              placeholder="Search…"
              value={filter.q}
              onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
            />
            <select className="input w-32" value={filter.type} onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}>
              <option value="">All types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
            <select className="input w-40" value={filter.status} onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s].text}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-3">Item</th>
                <th className="p-3">Type</th>
                <th className="p-3">Reporter</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((it) => (
                <tr key={it._id}>
                  <td className="p-3">
                    <Link to={`/items/${it._id}`} className="font-medium text-slate-800 hover:text-brand-600">
                      {it.title}
                    </Link>
                  </td>
                  <td className="p-3"><TypeBadge type={it.type} /></td>
                  <td className="p-3 text-slate-500">{it.reportedBy?.name || '—'}</td>
                  <td className="p-3 text-slate-500">{formatDate(it.dateLostOrFound)}</td>
                  <td className="p-3"><StatusBadge status={it.status} /></td>
                  <td className="p-3">
                    <select
                      className="input py-1 text-xs"
                      value={it.status}
                      onChange={(e) => setStatus(it._id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s].text}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="card text-center">
      <div className={`text-2xl font-extrabold ${accent ? 'text-brand-600' : 'text-slate-800'}`}>{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}
