
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, CheckCircle2, Circle, AlertCircle, Sparkles, Repeat } from 'lucide-react';
import { Bill, MonthData } from './types';
import CalendarGrid from './components/CalendarGrid';
import BillModal from './components/BillModal';
import { GoogleGenAI } from '@google/genai';

const App: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [currentMonth, setCurrentMonth] = useState<MonthData>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | undefined>(undefined);
  const [forceRecurring, setForceRecurring] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('boletotrack_bills');
    if (saved) {
      setBills(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('boletotrack_bills', JSON.stringify(bills));
  }, [bills]);

  const handleAddBill = (newBill: Omit<Bill, 'id'>, recurrenceMonths?: number) => {
    if (recurrenceMonths && recurrenceMonths > 1) {
      const newBills: Bill[] = [];
      const [year, month, day] = newBill.dueDate.split('-').map(Number);
      
      for (let i = 0; i < recurrenceMonths; i++) {
        // Create a date object and increment the month
        const date = new Date(year, month - 1 + i, day);
        
        newBills.push({
          ...newBill,
          id: crypto.randomUUID(),
          dueDate: date.toISOString().split('T')[0],
          isPaid: false // Recurring items usually start unpaid
        });
      }
      setBills(prev => [...prev, ...newBills]);
    } else {
      const bill: Bill = { ...newBill, id: crypto.randomUUID() };
      setBills(prev => [...prev, bill]);
    }
    setIsModalOpen(false);
    setForceRecurring(false);
  };

  const handleUpdateBill = (updatedBill: Bill) => {
    setBills(prev => prev.map(b => (b.id === updatedBill.id ? updatedBill : b)));
    setIsModalOpen(false);
    setEditingBill(undefined);
  };

  const handleDeleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const togglePaid = (id: string) => {
    setBills(prev => prev.map(b => 
      b.id === id ? { ...b, isPaid: !b.isPaid } : b
    ));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 11) return { month: 0, year: prev.year + 1 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const prevMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 0) return { month: 11, year: prev.year - 1 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const generateAiInsight = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const unpaidBills = bills.filter(b => !b.isPaid);
      const prompt = `Analise minhas contas a pagar e dê uma dica rápida de organização financeira em português (máximo 2 frases). Tenho ${bills.length} contas cadastradas, das quais ${unpaidBills.length} ainda não foram pagas. Algumas descrições: ${bills.slice(0, 5).map(b => b.description).join(', ')}.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiInsight(response.text || "Continue focado no seu planejamento!");
    } catch (error) {
      console.error("Erro ao gerar insight:", error);
      setAiInsight("Mantenha suas contas em dia para uma saúde financeira melhor.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="text-blue-600" />
            BoletoTrack
          </h1>
          <p className="text-slate-500">Organize seus pagamentos mensais sem estresse.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={generateAiInsight}
            disabled={isAiLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-sm font-medium border border-indigo-200"
          >
            <Sparkles size={16} />
            {isAiLoading ? 'Pensando...' : 'Dica do Mês'}
          </button>
          
          <button 
            onClick={() => { setForceRecurring(true); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95 text-sm"
          >
            <Repeat size={18} />
            Recorrente
          </button>

          <button 
            onClick={() => { setForceRecurring(false); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95 text-sm"
          >
            <Plus size={20} />
            Cadastro
          </button>
        </div>
      </header>

      {/* AI Box */}
      {aiInsight && (
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="text-indigo-500 shrink-0 mt-0.5" size={20} />
          <p className="text-indigo-900 italic text-sm md:text-base">{aiInsight}</p>
          <button onClick={() => setAiInsight(null)} className="ml-auto text-indigo-400 hover:text-indigo-600 font-bold">×</button>
        </div>
      )}

      {/* Main Calendar Section */}
      <main className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">
              {monthNames[currentMonth.month]} <span className="text-slate-400 font-normal">{currentMonth.year}</span>
            </h2>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-50 transition-colors border-r border-slate-100">
                <ChevronLeft size={20} className="text-slate-600" />
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-50 transition-colors">
                <ChevronRight size={20} className="text-slate-600" />
              </button>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-slate-600">Pago</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-slate-600">Pendente</span>
            </div>
          </div>
        </div>

        <CalendarGrid 
          month={currentMonth.month} 
          year={currentMonth.year} 
          bills={bills}
          onTogglePaid={togglePaid}
          onEditBill={(bill) => { setEditingBill(bill); setForceRecurring(false); setIsModalOpen(true); }}
        />
      </main>

      {/* Footer Stats */}
      <footer className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Total do Mês</p>
            <p className="text-2xl font-bold text-slate-900">
              {bills.filter(b => {
                const [bYear, bMonth] = b.dueDate.split('-').map(Number);
                return (bMonth - 1) === currentMonth.month && bYear === currentMonth.year;
              }).length} Contas
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <CalendarIcon size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Concluídos</p>
            <p className="text-2xl font-bold text-emerald-600">
              {bills.filter(b => {
                const [bYear, bMonth] = b.dueDate.split('-').map(Number);
                return (bMonth - 1) === currentMonth.month && bYear === currentMonth.year && b.isPaid;
              }).length} Pagas
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Restantes</p>
            <p className="text-2xl font-bold text-orange-600">
              {bills.filter(b => {
                const [bYear, bMonth] = b.dueDate.split('-').map(Number);
                return (bMonth - 1) === currentMonth.month && bYear === currentMonth.year && !b.isPaid;
              }).length} Pendentes
            </p>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <AlertCircle size={24} />
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isModalOpen && (
        <BillModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingBill(undefined); setForceRecurring(false); }}
          onSave={editingBill ? handleUpdateBill : handleAddBill}
          onDelete={editingBill ? () => { handleDeleteBill(editingBill.id); setIsModalOpen(false); setEditingBill(undefined); } : undefined}
          initialBill={editingBill}
          forceRecurring={forceRecurring}
        />
      )}
    </div>
  );
};

export default App;
