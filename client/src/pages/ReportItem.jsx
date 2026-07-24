import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, ShieldQuestion } from 'lucide-react';
import { apiPost } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import Button from '../components/ui/Button.jsx';
import { Input, Textarea } from '../components/ui/Input.jsx';
import Card from '../components/ui/Card.jsx';
import CategoryIcon from '../components/ui/CategoryIcon.jsx';
import { CATEGORIES } from '../utils/constants.js';
import { formatDate } from '../utils/format.js';

const slide = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
};

export default function ReportItem({ type }) {
  const isFound = type === 'found';
  const toast = useToast();
  const navigate = useNavigate();

  const steps = isFound
    ? ['Category', 'Description', 'Location & Date', 'Photos', 'Review']
    : ['Category', 'Description', 'Location & Date', 'Photos', 'Review'];

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    category: 'electronics',
    description: '',
    locationName: '',
    locationDetails: '',
    dateLostOrFound: new Date().toISOString().slice(0, 10),
    privateDetails: '',
  });
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const canProceed = () => {
    if (step === 0) return form.title.trim().length >= 2;
    if (step === 1) return form.description.trim().length >= 5;
    return true;
  };

  const next = () => {
    if (!canProceed()) {
      toast.error('Please fill in this step before continuing.');
      return;
    }
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    setBusy(true);
    try {
      const payload = {
        type,
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        location: { name: form.locationName, details: form.locationDetails },
        dateLostOrFound: form.dateLostOrFound,
        images,
        ...(isFound ? { privateDetails: form.privateDetails } : {}),
      };
      const data = await apiPost('/items', payload);
      toast.success(
        data.matchesCreated > 0
          ? `Reported! ${data.matchesCreated} potential match(es) found 🔍`
          : 'Item reported successfully 🌿'
      );
      navigate(`/items/${data.item._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to report item');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-2">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium text-ink">
          {isFound ? 'Report a found item' : 'Report a lost item'}
        </h1>
        <p className="text-sm text-ink-soft">
          {isFound
            ? 'Thank you for helping! Private details power secure verification and are never shown publicly.'
            : 'Describe what you lost — our AI starts looking for matches the moment you submit.'}
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  i < step
                    ? 'bg-primary text-white'
                    : i === step
                    ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-400'
                    : 'bg-black/[0.05] text-ink-soft/60'
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`hidden text-[11px] sm:block ${i === step ? 'font-medium text-ink' : 'text-ink-soft/60'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 rounded ${i < step ? 'bg-primary' : 'bg-black/[0.06]'}`} />
            )}
          </div>
        ))}
      </div>

      <Card hover={false} className="min-h-[360px] p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={step} {...slide} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
            {step === 0 && (
              <div className="space-y-5">
                <Input
                  label="Title"
                  required
                  value={form.title}
                  onChange={set('title')}
                  placeholder="e.g. Black Dell laptop"
                />
                <div>
                  <label className="label">Category</label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, category: c }))}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs capitalize transition ${
                          form.category === c
                            ? 'border-primary-400 bg-primary-50 text-primary-700'
                            : 'border-hairline text-ink-soft hover:border-primary-200 hover:bg-primary-50/40'
                        }`}
                      >
                        <CategoryIcon category={c} className="h-5 w-5" />
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <Textarea
                  label="Description"
                  required
                  rows={6}
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Color, brand, size, condition, and any visible features."
                />
                {isFound && (
                  <div className="rounded-2xl bg-amber-50 p-4">
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-amber-800">
                      <ShieldQuestion className="h-4 w-4" /> Private details (owner-only)
                    </label>
                    <textarea
                      className="input min-h-[90px] border-amber-200 bg-white/70 focus:border-amber-400 focus:ring-amber-100"
                      value={form.privateDetails}
                      onChange={set('privateDetails')}
                      placeholder="Distinguishing marks, contents, stickers, scratches… Never shown publicly — used to generate verification questions."
                    />
                    <p className="mt-1.5 text-xs text-amber-700">
                      This stays hidden and powers secure ownership verification.
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  label={`Date ${isFound ? 'found' : 'lost'}`}
                  type="date"
                  value={form.dateLostOrFound}
                  onChange={set('dateLostOrFound')}
                />
                <div />
                <Input label="Location" value={form.locationName} onChange={set('locationName')} placeholder="e.g. Central Library" />
                <Input label="Location details" value={form.locationDetails} onChange={set('locationDetails')} placeholder="e.g. 2nd floor" />
              </div>
            )}

            {step === 3 && (
              <div>
                <label className="label">Photos</label>
                <ImageUploader value={images} onChange={setImages} max={4} />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-ink">Review your report</h3>
                <dl className="divide-y divide-hairline rounded-xl bg-black/[0.02] px-4">
                  <ReviewRow label="Title" value={form.title || '—'} />
                  <ReviewRow label="Category" value={<span className="capitalize">{form.category}</span>} />
                  <ReviewRow label="Description" value={form.description || '—'} />
                  <ReviewRow label="Location" value={`${form.locationName || 'Unknown'}${form.locationDetails ? ` — ${form.locationDetails}` : ''}`} />
                  <ReviewRow label="Date" value={formatDate(form.dateLostOrFound)} />
                  <ReviewRow label="Photos" value={`${images.length} attached`} />
                  {isFound && <ReviewRow label="Private details" value={form.privateDetails ? 'Provided ✓' : 'None'} />}
                </dl>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Card>

      <div className="mt-5 flex justify-between">
        <Button variant="outline" icon={ChevronLeft} onClick={back} disabled={step === 0 || busy}>
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button iconRight={ChevronRight} onClick={next}>
            Continue
          </Button>
        ) : (
          <Button loading={busy} onClick={submit}>
            {isFound ? 'Report found item' : 'Report lost item'}
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 text-sm">
      <dt className="shrink-0 text-ink-soft">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
