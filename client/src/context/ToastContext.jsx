import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let idSeq = 0;

const STYLES = {
  success: { icon: CheckCircle2, cls: 'bg-ink text-white', iconCls: 'text-accent' },
  error: { icon: AlertCircle, cls: 'bg-danger text-white', iconCls: 'text-white' },
  info: { icon: Info, cls: 'bg-ink text-white', iconCls: 'text-primary-300' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info', duration = 3500) => {
      idSeq += 1;
      const id = idSeq;
      setToasts((t) => [...t, { id, message, type }]);
      if (duration) setTimeout(() => remove(id), duration);
      return id;
    },
    [remove]
  );

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error', 5000),
    info: (m) => push(m, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const s = STYLES[t.type] || STYLES.info;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => remove(t.id)}
                className={`flex cursor-pointer items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lift ${s.cls}`}
              >
                <s.icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.iconCls}`} />
                <span className="flex-1">{t.message}</span>
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
