
import React, { useState, useEffect } from 'react';
import { Bill } from '../types.ts';
import { X, Trash2, Calendar, FileText, Repeat } from 'lucide-react';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: any, recurrence?: number) => void;
  onDelete?: () => void;
  initialBill?: Bill;
  forceRecurring?: boolean;
}

const BillModal: React.FC<BillModalProps> = ({ isOpen, onClose, onSave, onDelete, initialBill, forceRecurring }) => {
  const [description, setDescription] = useState(initialBill?.description || '');
  const [dueDate, setDueDate] = useState(initialBill?.dueDate || new Date().toISOString().split('T')[0]);
  const [isPaid, setIsPaid] = useState(initialBill?.isPaid || false);
  const [isRecurring, setIsRecurring] = useState(forceRecurring || false);
  const [recurrenceMonths, setRecurrenceMonths] = useState(12);

  useEffect(() => {
    if (initialBill) {
      setDescription(initialBill.description);
      setDueDate(initialBill.dueDate);
      setIsPaid(initialBill.isPaid);
      setIsRecurring(false);
    } else {
      setIsRecurring(forceRecurring || false);
    }
  }, [initialBill, forceRecurring]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !dueDate) return;
    
    if (initialBill) {
      onSave({ ...initialBill, description, dueDate, isPaid });
    } else {
      onSave({ description, dueDate, isPaid }, isRecurring ? recurrenceMonths : undefined);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">
            {initialBill ? 'Editar Pagamento' : (isRecurring ? 'Novo Pagamento Recorrente' : 'Novo Pagamento')}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
              <FileText size={16} className="text-blue-500" />
              Descrição da Conta
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Aluguel, Internet, Cartão..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-800"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" />
              Data de Vencimento {isRecurring && '(Primeiro Mês)'}
            </label>
            <input
              type="date"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-800"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          {!initialBill && (
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsRecurring(!isRecurring)}>
                <label className="flex items-center gap-2 text-sm font-semibold text-indigo-900 cursor-pointer">
                  <Repeat size={16} className="text-indigo-500" />
                  Repetir mensalmente
                </label>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                  checked={isRecurring}
                  onChange={(e) => { e.stopPropagation(); setIsRecurring(e.target.checked); }}
                />
              </div>
              
              {isRecurring && (
                <div className="animate-in slide-in-from-top-1 duration-200">
                  <label className="block text-xs font-bold text-indigo-700 mb-1 uppercase tracking-wider">
                    Duração (Meses)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    className="w-full px-4 py-2 rounded-lg border border-indigo-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-indigo-900"
                    value={recurrenceMonths}
                    onChange={e => setRecurrenceMonths(parseInt(e.target.value) || 2)}
                  />
                  <p className="mt-1.5 text-[10px] text-indigo-500">
                    Isso criará {recurrenceMonths} contas idênticas para os próximos meses.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 py-1">
            <label className="relative inline-flex items-center cursor-pointer group">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isPaid}
                onChange={() => setIsPaid(!isPaid)}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 group-active:scale-95 transition-transform"></div>
              <span className="ml-3 text-sm font-medium text-slate-700 select-none">Marcar como Pago</span>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-between gap-3">
            {initialBill && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-semibold"
              >
                <Trash2 size={18} />
                Excluir
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg active:scale-95"
              >
                Salvar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillModal;
