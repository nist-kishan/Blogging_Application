import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="glass max-w-md w-full p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Glow decoration */}
        <div className={`absolute -top-12 -left-12 w-24 h-24 rounded-full blur-2xl ${isDanger ? 'bg-red-500/10' : 'bg-primary-500/10'}`}></div>

        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center mt-2">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 border ${
            isDanger 
              ? 'bg-red-500/10 border-red-500/20 text-red-400' 
              : 'bg-primary-500/10 border-primary-500/20 text-primary-400'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-white mb-2 leading-tight">
            {title}
          </h3>
          
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-sm font-semibold text-slate-300 hover:text-white transition select-none cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white transition active:scale-[0.98] select-none cursor-pointer ${
              isDanger 
                ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/25' 
                : 'bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-500/25'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
