import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, PartyPopper, Clock } from 'lucide-react';
import { apiPost } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { LineSkeleton } from '../components/Skeleton.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';

export default function VerifyOwnership() {
  const { id: matchId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [verification, setVerification] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    apiPost('/verifications', { matchId })
      .then((v) => {
        setVerification(v);
        setAnswers(new Array(v.questions.length).fill(''));
      })
      .catch((err) => {
        toast.error(err.message);
        navigate(`/matches/${matchId}`);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  const submit = async (e) => {
    e.preventDefault();
    if (answers.some((a) => !a.trim())) {
      toast.error('Please answer all questions.');
      return;
    }
    setBusy(true);
    try {
      const res = await apiPost(`/verifications/${verification.id}/answer`, { answers });
      setResult(res);
      if (res.status === 'approved') {
        toast.success('Ownership verified! 🎉');
      } else {
        toast.info('Submitted for manual review.');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LineSkeleton rows={6} />;

  return (
    <div className="mx-auto max-w-xl">
      <Link to={`/matches/${matchId}`} className="mb-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to match
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card hover={false} className="p-7">
          <div className="mb-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50">
              <ShieldCheck className="h-5 w-5 text-primary-600" />
            </div>
            <h1 className="font-display text-xl font-medium text-ink">Verify ownership</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Answer these questions generated from details only the true owner would know.
            </p>
          </div>

          {result ? (
            <ResultView result={result} matchId={matchId} navigate={navigate} />
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {verification.questions.map((q, i) => (
                <Input
                  key={i}
                  label={`${i + 1}. ${q}`}
                  value={answers[i]}
                  onChange={(e) => {
                    const next = [...answers];
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                  placeholder="Your answer"
                />
              ))}
              <Button type="submit" loading={busy} className="w-full" size="lg">
                Submit answers
              </Button>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

function ResultView({ result, matchId, navigate }) {
  const approved = result.status === 'approved';
  const Icon = approved ? PartyPopper : Clock;
  return (
    <div className="text-center">
      <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${approved ? 'bg-primary-50' : 'bg-amber-50'}`}>
        <Icon className={`h-7 w-7 ${approved ? 'text-primary-600' : 'text-amber-600'}`} />
      </div>
      <h2 className="font-display text-lg font-semibold text-ink">
        {approved ? 'Ownership verified!' : 'Awaiting manual review'}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">{result.message}</p>
      {typeof result.score === 'number' && (
        <p className="mt-2 text-sm text-ink">
          AI match score: <b>{result.score}%</b>
        </p>
      )}
      <Button onClick={() => navigate(`/matches/${matchId}`)} size="lg" className="mt-5">
        {approved ? 'View contact & handover details' : 'Back to match'}
      </Button>
    </div>
  );
}
