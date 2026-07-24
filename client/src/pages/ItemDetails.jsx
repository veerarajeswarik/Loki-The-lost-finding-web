import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, User, ScanSearch, Shuffle, Trash2 } from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../context/ToastContext.jsx';
import { StatusBadge, TypeBadge } from '../components/Badges.jsx';
import { LineSkeleton } from '../components/Skeleton.jsx';
import CategoryIcon from '../components/ui/CategoryIcon.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import { formatDate } from '../utils/format.js';

export default function ItemDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiGet(`/items/${id}`)
      .then(setItem)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isOwner = user && item && String(item.reportedBy?._id) === String(user._id);

  const rematch = async () => {
    setBusy(true);
    try {
      const data = await apiPost(`/items/${id}/rematch`);
      toast.success(
        data.matchesCreated > 0
          ? `${data.matchesCreated} match(es) found! Check the Matches page.`
          : 'No new matches found yet.'
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    try {
      await apiDelete(`/items/${id}`);
      toast.success('Item deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="skeleton mb-4 h-64 w-full rounded-2xl" />
        <LineSkeleton rows={4} />
      </div>
    );
  }

  if (!item) {
    return <p className="text-center text-ink-soft">Item not found.</p>;
  }

  const cover = item.images?.[active]?.url;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/browse" className="mb-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to browse
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-primary-50/60">
            {cover ? (
              <img src={cover} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <CategoryIcon category={item.category} className="h-20 w-20 text-primary-400" strokeWidth={1.25} />
            )}
          </div>
          {item.images?.length > 1 && (
            <div className="mt-2 flex gap-2">
              {item.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-14 w-14 overflow-hidden rounded-lg ring-2 transition ${
                    i === active ? 'ring-primary-500' : 'ring-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <TypeBadge type={item.type} />
            <StatusBadge status={item.status} />
            <Badge tone="neutral" className="!gap-1.5">
              <CategoryIcon category={item.category} className="h-3 w-3" />
              {item.category}
            </Badge>
          </div>
          <h1 className="font-display text-2xl font-medium text-ink">{item.title}</h1>
          <p className="mt-3 whitespace-pre-line text-ink-soft">{item.description}</p>

          <Card hover={false} padding="p-4" className="mt-5 space-y-2.5 bg-black/[0.015]">
            <Row icon={MapPin} label="Location" value={`${item.location?.name || 'Unknown'}${item.location?.details ? ` — ${item.location.details}` : ''}`} />
            <Row icon={Calendar} label={item.type === 'lost' ? 'Date lost' : 'Date found'} value={formatDate(item.dateLostOrFound)} />
            <Row icon={User} label="Reported by" value={item.reportedBy?.name || 'Anonymous'} />
          </Card>

          <div className="mt-6 flex flex-wrap gap-2">
            {isAuthenticated && (
              <Button onClick={rematch} loading={busy} icon={ScanSearch}>
                Search matches
              </Button>
            )}
            {isOwner && (
              <>
                <Button to="/matches" variant="secondary" icon={Shuffle}>
                  View my matches
                </Button>
                <Button onClick={remove} variant="danger" icon={Trash2}>
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" strokeWidth={1.75} />
      <div>
        <dt className="text-xs text-ink-soft/70">{label}</dt>
        <dd className="text-ink">{value}</dd>
      </div>
    </div>
  );
}
