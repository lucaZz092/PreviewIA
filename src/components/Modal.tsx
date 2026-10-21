import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const fieldClass =
  'w-full h-9 px-3 rounded-md border border-neutral-200 bg-white text-[13px] text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors';
export const textareaClass =
  'w-full px-3 py-2 rounded-md border border-neutral-200 bg-white text-[13px] leading-relaxed text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors resize-none';
export const primaryButton =
  'h-9 px-4 rounded-md bg-neutral-900 hover:bg-neutral-700 disabled:opacity-40 text-white text-[13px] font-medium transition-colors whitespace-nowrap';
export const secondaryButton =
  'h-9 px-4 rounded-md border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 text-neutral-700 text-[13px] font-medium transition-colors whitespace-nowrap';
export const linkButton = 'text-[13px] text-neutral-500 hover:text-neutral-900 disabled:opacity-40 transition-colors';

export const Field: React.FC<{ label: string; className?: string; children: React.ReactNode }> = ({ label, className = '', children }) => (
  <label className={`block ${className}`}>
    <span className="block mb-1.5 text-xs text-neutral-500">{label}</span>
    {children}
  </label>
);

export function Tabs<T extends string>({ tabs, active, onChange }: { tabs: { id: T; label: string }[]; active: T; onChange: (id: T) => void }) {
  return (
    <nav className="flex gap-5 border-b border-neutral-200">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`-mb-px border-b pb-2.5 text-[13px] transition-colors ${
            active === tab.id ? 'border-neutral-900 text-neutral-900 font-medium' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

interface ModalProps {
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

export const Modal: React.FC<ModalProps> = ({ title, onClose, children, footer, size = 'md' }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/20 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        className={`w-full ${widths[size]} max-h-[90vh] flex flex-col bg-white rounded-xl shadow-xl ring-1 ring-black/5`}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3 no-print">
          <h2 className="text-base font-semibold text-neutral-900 min-w-0 flex-1">{title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="-mr-2 -mt-0.5 p-1.5 text-neutral-400 hover:text-neutral-900 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 pb-6 pt-1 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-2 no-print">{footer}</div>}
      </div>
    </div>
  );
};
