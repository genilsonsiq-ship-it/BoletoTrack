
import React from 'react';
import { Bill } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface CalendarGridProps {
  month: number;
  year: number;
  bills: Bill[];
  onTogglePaid: (id: string) => void;
  onEditBill: (bill: Bill) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ month, year, bills, onTogglePaid, onEditBill }) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  
  // Create an array for the grid
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getBillsForDay = (day: number) => {
    return bills.filter(bill => {
      const d = new Date(bill.dueDate);
      // Adjusting for potential timezone shifts in basic strings
      // We assume YYYY-MM-DD format
      const [bYear, bMonth, bDay] = bill.dueDate.split('-').map(Number);
      return bDay === day && (bMonth - 1) === month && bYear === year;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto min-h-[600px]">
      {/* Week Day Headers */}
      <div className="calendar-grid border-b border-slate-100 bg-slate-50">
        {weekDays.map(wd => (
          <div key={wd} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            {wd}
          </div>
        ))}
      </div>

      {/* Actual Days */}
      <div className="calendar-grid flex-1">
        {days.map((day, idx) => {
          const dayBills = day ? getBillsForDay(day) : [];
          
          return (
            <div 
              key={idx} 
              className={`min-h-[120px] p-2 border-b border-r border-slate-50 relative group transition-colors 
                ${day === null ? 'bg-slate-50/30' : 'bg-white hover:bg-slate-50/50'}`}
            >
              {day && (
                <>
                  <span className={`text-sm font-semibold mb-2 inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors
                    ${isToday(day) ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'}`}>
                    {day}
                  </span>
                  
                  <div className="space-y-1.5 mt-2">
                    {dayBills.map(bill => (
                      <div 
                        key={bill.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditBill(bill);
                        }}
                        className={`text-[10px] md:text-xs p-1.5 rounded-md border flex items-center justify-between gap-1 cursor-pointer transition-all shadow-sm hover:shadow-md
                          ${bill.isPaid 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                            : 'bg-white border-orange-100 text-slate-700'
                          }`}
                      >
                        <span className="truncate font-medium flex-1">{bill.description}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePaid(bill.id);
                          }}
                          className={`shrink-0 transition-colors ${bill.isPaid ? 'text-emerald-500' : 'text-slate-300 hover:text-orange-500'}`}
                        >
                          {bill.isPaid ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
