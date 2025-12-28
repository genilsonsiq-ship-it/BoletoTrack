
export interface Bill {
  id: string;
  description: string;
  amount?: number;
  dueDate: string; // ISO date string YYYY-MM-DD
  isPaid: boolean;
  category?: string;
}

export type MonthData = {
  month: number;
  year: number;
};
