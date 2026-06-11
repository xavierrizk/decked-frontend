import React, { useState, useEffect } from 'react';

/**
 * DeleteModal — requires typing "DELETE" to confirm.
 *
 * Props:
 *   open       — boolean
 *   onClose    — () => void
 *   onConfirm  — () => void (called when user types DELETE and clicks confirm)
 *   title      — string
 *   warning    — string  (red warning text)
 *   stats      — [{ label, value }]  (stats shown before confirm)
 *   loading    — boolean
 */
export default function DeleteModal({ open, onClose, onConfirm, title, warning, stats = [], loading }) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  if (!open) return null;

  const confirmed = typed === 'DELETE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0d0d0f] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Red accent top */}
        <div className="h-1 bg-gradient-to-r from-red-600 to-red-400" />

        <div className="p-6">
          {/* Icon + title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl flex-shrink-0">🗑️</div>
            <h2 className="text-white font-extrabold text-lg">{title}</h2>
          </div>

          {/* Warning */}
          {warning && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-300 text-sm font-medium">⚠️ {warning}</p>
            </div>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {stats.map(({ label, value }) => (
                <div key={label} className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3 text-center">
                  <p className="text-white font-bold text-lg">{value}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Confirmation input */}
          <div className="mb-5">
            <label className="block text-gray-400 text-sm mb-2">
              Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm
            </label>
            <input
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-white/[0.04] border border-white/10 focus:border-red-500/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-700 font-mono text-sm outline-none transition-colors"
              autoFocus
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:border-white/30 hover:text-white text-sm font-semibold transition-all duration-200">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={!confirmed || loading}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              {loading ? 'Deleting…' : '🗑️ Delete Permanently'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
