import API_URL from '../api';
import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from './Toast';
import Toast from './Toast';

const REASONS = ['Spam', 'Harassment', 'Inappropriate Content', 'Copyright Violation', 'Other'];

const TYPE_STYLE = {
  set:     'bg-brand-600/20 text-brand-300 border-brand-600/30',
  comment: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  user:    'bg-orange-500/20 text-orange-300 border-orange-500/30',
};

export default function ReportModal({ open, onClose, reportType, targetId, targetName }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, showToast] = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/reports`, {
        report_type: reportType,
        target_id: targetId,
        reason,
        description: description.trim(),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      showToast('Report submitted. Thank you for keeping Decked safe.');
      setTimeout(() => {
        setDescription('');
        setReason(REASONS[0]);
        onClose();
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.error;
      setError(msg || 'Failed to submit report. Please try again.');
    }
    setSubmitting(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Toast message={toast} />
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0d0d0f] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-600 to-orange-500" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl flex-shrink-0">🚩</div>
            <div>
              <h2 className="text-white font-extrabold text-lg">Report {targetName}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${TYPE_STYLE[reportType] || 'bg-white/10 text-gray-300 border-white/20'}`}>
                {reportType}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Reason</label>
              <select value={reason} onChange={e => setReason(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors">
                {REASONS.map(r => <option key={r} value={r} className="bg-[#0d0d0f]">{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Description <span className="text-gray-600">(required, min 10 chars)</span></label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4}
                placeholder="Please describe the issue in detail…"
                className="w-full bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors resize-none" />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white text-sm font-semibold transition-all duration-200">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-sm font-bold transition-all duration-200">
                {submitting ? '…' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
