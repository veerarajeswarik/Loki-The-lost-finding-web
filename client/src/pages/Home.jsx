import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Search, ShieldCheck, Sparkles, GraduationCap, Users, ChevronDown,
  Laptop, KeyRound, Backpack, ScanSearch,
} from 'lucide-react';
import { apiGet } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const STEPS = [
  { icon: Search, title: 'Report', text: 'Log a lost or found item in under a minute — photos, category, and location.' },
  { icon: ScanSearch, title: 'Match', text: 'Gemini compares descriptions and images to surface likely matches instantly.' },
  { icon: ShieldCheck, title: 'Verify', text: 'Smart questions confirm true ownership before any contact is exchanged.' },
  { icon: Sparkles, title: 'Return', text: 'The item finds its way home — safely, and on the record.' },
  { icon: GraduationCap, title: 'Grow', text: 'Honest finders earn personalized learning resources as thanks.' },
];

const FEATURES = [
  { icon: ScanSearch, title: 'AI-powered matching', text: 'Gemini-driven comparison of descriptions and images finds likely matches automatically, with a confidence score and plain-language reasoning.' },
  { icon: ShieldCheck, title: 'Secure verification', text: 'Ownership is confirmed through private, AI-generated questions — contact details stay hidden until a match is verified.' },
  { icon: GraduationCap, title: 'Educational rewards', text: 'Every honest return earns curated learning resources — roadmaps, interview prep, and career guides tailored to your interests.' },
  { icon: Users, title: 'Community trust', text: 'A public leaderboard and trust score celebrate the students, faculty, and staff who keep campus honest.' },
];

const FAQS = [
  { q: 'How does LOKII match lost items with found ones?', a: 'When you report an item, our AI compares its description, category, and photos against opposite-type reports from the last 30 days and scores how likely they are the same object.' },
  { q: 'How do you prevent false ownership claims?', a: 'Finders record private details only the true owner would know. Claimants answer AI-generated questions built from those details, and only a strong match reveals contact information.' },
  { q: 'What are educational rewards?', a: 'Every verified return earns the finder a set of personalized learning resources — roadmaps, interview prep, cheat sheets — picked to match their stated interests.' },
  { q: 'Is LOKII free for my campus?', a: 'Yes — LOKII is built for educational institutions and is free to use for students, faculty, staff, and campus security.' },
];

const TESTIMONIALS = [
  { quote: 'I got my laptop back within a day of reporting it lost. The verification questions felt genuinely secure, not just a formality.', role: 'Computer Science Student' },
  { quote: 'Returning a found wallet earned me an interview-prep bundle I actually used. Small thing, but it made honesty feel rewarding.', role: 'Library Staff' },
  { quote: 'As campus security, the admin view gives us a clear, auditable trail for every claim — something we never had before.', role: 'Campus Security Officer' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    apiGet('/rewards/leaderboard')
      .then((users) => {
        const returns = users.reduce((s, u) => s + (u.stats?.itemsReturned || 0), 0);
        setStats({ finders: users.length, returns });
      })
      .catch(() => setStats(null));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="container-shell px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered campus recovery
            </span>
            <h1 className="text-balance font-display text-4xl font-medium leading-[1.08] text-ink sm:text-5xl lg:text-6xl">
              Lost today,
              <br />
              kindness stays.
            </h1>
            <p className="mt-6 max-w-md text-lg text-ink-soft">
              LOKII reunites your campus with what it's lost — and turns every honest return
              into a moment of recognition and growth.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button to={isAuthenticated ? '/report/lost' : '/register'} size="lg" icon={Search}>
                Report a lost item
              </Button>
              <Button to="/browse" size="lg" variant="outline" iconRight={ArrowRight}>
                Browse items
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-ink-soft">
              <div>
                <span className="font-display text-2xl font-semibold text-ink">{stats ? `${stats.returns}+` : '—'}</span>
                <p className="text-xs">items returned</p>
              </div>
              <div className="h-8 w-px bg-hairline" />
              <div>
                <span className="font-display text-2xl font-semibold text-ink">{stats ? stats.finders : '—'}</span>
                <p className="text-xs">honest finders</p>
              </div>
              <div className="h-8 w-px bg-hairline" />
              <div>
                <span className="font-display text-2xl font-semibold text-ink">100%</span>
                <p className="text-xs">verified handovers</p>
              </div>
            </div>
          </motion.div>

          {/* Original abstract hero graphic — layered item cards + AI match glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto aspect-square w-full max-w-md"
          >
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary-100 via-accent/10 to-transparent blur-2xl" />
            <FloatCard className="left-0 top-6" icon={Laptop} label="Black Dell Laptop" sub="Central Library" delay={0.1} />
            <FloatCard className="right-0 top-24" icon={KeyRound} label="Car keys" sub="Parking Lot B" delay={0.25} />
            <FloatCard className="bottom-10 left-6" icon={Backpack} label="Grey backpack" sub="Lecture Hall 3" delay={0.4} />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 m-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-primary text-white shadow-lift"
            >
              <div className="text-center">
                <Sparkles className="mx-auto mb-1 h-6 w-6" />
                <p className="text-xs font-semibold">92% match</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-shell px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="mb-10 text-center"
        >
          <h2 className="font-display text-3xl font-medium text-ink">How LOKII works</h2>
          <p className="mt-2 text-ink-soft">From report to recovery to recognition — five simple steps.</p>
        </motion.div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              transition={{ delay: i * 0.06 }}
            >
              <Card hover={false} className="h-full text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50">
                  <s.icon className="h-5 w-5 text-primary-600" strokeWidth={1.75} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary-500">Step {i + 1}</p>
                <h3 className="mt-1 font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{s.text}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-primary-50/40 py-16">
        <div className="container-shell px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-10 text-center">
            <h2 className="font-display text-3xl font-medium text-ink">Built for trust, not just tracking</h2>
            <p className="mt-2 text-ink-soft">Every feature is designed to make honesty the easiest choice.</p>
          </motion.div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                transition={{ delay: i * 0.07 }}
              >
                <Card className="flex h-full items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
                    <f.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-ink-soft">{f.text}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-shell px-4 py-16 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-10 text-center">
          <h2 className="font-display text-3xl font-medium text-ink">Voices from campus</h2>
          <p className="mt-2 text-ink-soft">Illustrative feedback from the kind of people LOKII is built for.</p>
        </motion.div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.role}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              transition={{ delay: i * 0.08 }}
            >
              <Card hover={false} className="h-full">
                <Sparkles className="mb-3 h-5 w-5 text-accent" />
                <p className="text-sm text-ink-soft">"{t.quote}"</p>
                <p className="mt-4 text-xs font-semibold text-ink-soft/80">{t.role}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-shell px-4 py-16 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center font-display text-3xl font-medium text-ink">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={f.q} className="overflow-hidden rounded-2xl bg-surface ring-1 ring-hairline">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-medium text-ink">{f.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-ink-soft transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 pb-4 text-sm text-ink-soft"
                  >
                    {f.a}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="container-shell px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="rounded-3xl bg-gradient-to-br from-primary-700 to-primary-900 px-8 py-14 text-center text-white"
        >
          <h2 className="font-display text-3xl font-medium">Lost something? Found something?</h2>
          <p className="mx-auto mt-2 max-w-md text-primary-100">
            Join your campus community and help belongings find their way home.
          </p>
          <Button
            to={isAuthenticated ? '/dashboard' : '/register'}
            size="lg"
            className="mt-7 !bg-white !text-primary-700 hover:!bg-primary-50"
          >
            {isAuthenticated ? 'Go to dashboard' : 'Create your account'}
          </Button>
        </motion.div>
      </section>
    </div>
  );
}

function FloatCard({ className, icon: Icon, label, sub, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute flex w-44 items-center gap-3 rounded-2xl bg-surface p-3 shadow-lift ring-1 ring-hairline ${className}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-ink">{label}</p>
        <p className="truncate text-[11px] text-ink-soft">{sub}</p>
      </div>
    </motion.div>
  );
}
