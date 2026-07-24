import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, CheckCircle2, XCircle, Mail, Phone, PartyPopper } from 'lucide-react';
import { apiGet, apiPost } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { MatchStatusBadge, ConfidenceBar, TypeBadge } from '../components/Badges.jsx';
import { LineSkeleton } from '../components/Skeleton.jsx';
import CategoryIcon from '../components/ui/CategoryIcon.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';

export default function MatchDetails() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await apiGet(`/matches/${id}`));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const accept = async () => {
    setBusy(true);
    try {
      await apiPost(`/matches/${id}/accept`);
      toast.success('Match accepted — let’s verify ownership.');
      navigate(`/matches/${id}/verify`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    setBusy(true);
    try {
      await apiPost(`/matches/${id}/reject`);
      toast.info('Match rejected.');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const review = async (decision) => {
    setBusy(true);
    try {
      await apiPost(`/verifications/${data.verification.id}/review`, { decision });
      toast.success(`Verification ${decision}.`);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LineSkeleton rows={6} />;
  if (!data) return <p className="text-center text-ink-soft">Match not found.</p>;

  const { match, lostItem, foundItem, contactRevealed, viewer, verification } = data;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/matches" className="mb-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to matches
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card hover={false} className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="font-display text-xl font-medium text-ink">AI Match Result</h1>
            <MatchStatusBadge status={match.status} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ItemPanel item={lostItem} />
            <ItemPanel item={foundItem} />
          </div>

          <div className="mt-5">
            <ConfidenceBar score={match.aiConfidenceScore} />
            {match.aiReasoning && (
              <div className="mt-3 flex gap-2 rounded-xl bg-primary-50 p-3.5 text-sm text-ink">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                <span>{match.aiReasoning}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        {['suggested', 'accepted'].includes(match.status) && viewer.isLostOwner && (
          <Card hover={false} className="mb-6">
            <h2 className="mb-1.5 font-semibold text-ink">Is this your item?</h2>
            <p className="mb-4 text-sm text-ink-soft">
              If this looks like your lost item, start secure ownership verification.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={accept} loading={busy} icon={CheckCircle2}>
                This looks like mine — verify
              </Button>
              <Button onClick={reject} disabled={busy} variant="ghost">
                Not mine
              </Button>
            </div>
          </Card>
        )}

        {/* Finder / privileged manual review */}
        {verification?.status === 'pending' &&
          (viewer.isFoundOwner || viewer.isPrivileged) &&
          verification.answers?.length > 0 && (
            <Card hover={false} className="mb-6">
              <h2 className="mb-1.5 font-semibold text-ink">Review claimant's answers</h2>
              <p className="mb-3 text-sm text-ink-soft">
                AI similarity score: <b className="text-ink">{verification.aiScore ?? '—'}%</b>. {verification.aiFeedback}
              </p>
              <ol className="mb-4 space-y-2 text-sm">
                {verification.questions.map((q, i) => (
                  <li key={i} className="rounded-lg bg-black/[0.02] p-3">
                    <p className="font-medium text-ink">Q{i + 1}. {q}</p>
                    <p className="mt-0.5 text-ink-soft">↳ {verification.answers[i] || '(no answer)'}</p>
                  </li>
                ))}
              </ol>
              <div className="flex gap-2">
                <Button onClick={() => review('approved')} loading={busy} icon={CheckCircle2}>
                  Approve handover
                </Button>
                <Button onClick={() => review('rejected')} disabled={busy} variant="danger" icon={XCircle}>
                  Reject
                </Button>
              </div>
            </Card>
          )}

        {verification?.status === 'pending' && viewer.isLostOwner && verification.answers?.length > 0 && (
          <Card hover={false} className="mb-6 bg-primary-50">
            <p className="flex items-center gap-2 text-sm text-primary-800">
              <Sparkles className="h-4 w-4" /> Your answers were submitted (AI score {verification.aiScore}%). Awaiting the finder's review.
            </p>
          </Card>
        )}

        {/* Contact reveal on completion */}
        {contactRevealed && (
          <Card hover={false} className="border border-primary-200 bg-primary-50">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-primary-800">
              <PartyPopper className="h-5 w-5" /> Ownership verified — arrange handover
            </h2>
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <ContactPanel title="Owner" person={lostItem.reportedBy} />
              <ContactPanel title="Finder" person={foundItem.reportedBy} />
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

function ItemPanel({ item }) {
  const cover = item?.images?.[0]?.url;
  return (
    <div className="rounded-xl bg-black/[0.02] p-3">
      <div className="mb-2 flex items-center gap-2">
        <TypeBadge type={item.type} />
        <span className="text-xs text-ink-soft/70 capitalize">{item.category}</span>
      </div>
      <div className="mb-2 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-surface">
        {cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <CategoryIcon category={item.category} className="h-10 w-10 text-primary-400" strokeWidth={1.25} />
        )}
      </div>
      <p className="font-semibold text-ink">{item.title}</p>
      <p className="line-clamp-2 text-xs text-ink-soft">{item.description}</p>
      <p className="mt-1 text-xs text-ink-soft/70">📍 {item.location?.name || 'Unknown'}</p>
    </div>
  );
}

function ContactPanel({ title, person }) {
  return (
    <div className="rounded-lg bg-surface p-3">
      <p className="text-xs font-semibold uppercase text-ink-soft/70">{title}</p>
      <p className="font-medium text-ink">{person?.name}</p>
      {person?.email && (
        <p className="mt-1 flex items-center gap-1.5 text-ink-soft">
          <Mail className="h-3.5 w-3.5" /> {person.email}
        </p>
      )}
      {person?.phone && (
        <p className="mt-0.5 flex items-center gap-1.5 text-ink-soft">
          <Phone className="h-3.5 w-3.5" /> {person.phone}
        </p>
      )}
      {person?.department && <p className="mt-0.5 text-xs text-ink-soft/70">{person.department}</p>}
    </div>
  );
}
