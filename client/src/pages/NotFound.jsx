import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-50">
          <Compass className="h-8 w-8 text-primary-500" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-5xl font-medium text-ink">404</h1>
        <p className="mt-2 text-ink-soft">This page wandered off and got lost.</p>
        <Button to="/" size="lg" className="mt-7">
          Back home
        </Button>
      </motion.div>
    </div>
  );
}
