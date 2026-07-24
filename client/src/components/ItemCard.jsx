import { MapPin, Clock } from 'lucide-react';
import Card from './ui/Card.jsx';
import CategoryIcon from './ui/CategoryIcon.jsx';
import { StatusBadge, TypeBadge } from './Badges.jsx';
import { timeAgo } from '../utils/format.js';

export default function ItemCard({ item }) {
  const cover = item.images?.[0]?.url;
  return (
    <Card to={`/items/${item._id}`} padding="p-4">
      <div className="mb-3 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-primary-50/60">
        {cover ? (
          <img src={cover} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <CategoryIcon category={item.category} className="h-12 w-12 text-primary-400" strokeWidth={1.25} />
        )}
      </div>
      <div className="mb-2 flex items-center gap-1.5">
        <TypeBadge type={item.type} />
        <StatusBadge status={item.status} />
      </div>
      <h3 className="line-clamp-1 font-semibold text-ink">{item.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{item.description}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-ink-soft/70">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {item.location?.name || 'Unknown'}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {timeAgo(item.createdAt)}
        </span>
      </div>
    </Card>
  );
}
