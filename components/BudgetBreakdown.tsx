'use client';

import { BudgetBreakdown as BudgetType } from '@/lib/types';

interface BudgetBreakdownProps {
  budget: BudgetType;
  userBudget: number;
  travelers: number;
}

const categories = [
  { key: 'flights' as const, label: 'Flights', icon: '✈️', color: 'bg-blue-500' },
  { key: 'accommodation' as const, label: 'Accommodation', icon: '🏨', color: 'bg-purple-500' },
  { key: 'food' as const, label: 'Food & Dining', icon: '🍽️', color: 'bg-amber-500' },
  { key: 'activities' as const, label: 'Activities', icon: '🎯', color: 'bg-teal-500' },
  { key: 'transport' as const, label: 'Local Transport', icon: '🚌', color: 'bg-indigo-500' },
  { key: 'misc' as const, label: 'Miscellaneous', icon: '💼', color: 'bg-gray-400' },
];

export default function BudgetBreakdown({ budget, userBudget, travelers }: BudgetBreakdownProps) {
  const withinBudget = budget.total <= userBudget;
  const difference = Math.abs(userBudget - budget.total);
  const perPerson = Math.round(budget.total / 2);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-lg mb-1">Budget Breakdown</h3>
        <p className="text-sm text-gray-500">Estimated costs for {travelers} travelers, 7 days</p>
      </div>

      <div className="p-5 space-y-4">
        {/* Total vs user budget */}
        <div className={`rounded-xl p-4 ${withinBudget ? 'bg-teal-50 border border-teal-200' : 'bg-orange-50 border border-orange-200'}`}>
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-xs font-medium text-gray-500">Estimated Total</p>
              <p className="text-2xl font-bold text-gray-900">${budget.total.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-500">Your Budget</p>
              <p className="text-2xl font-bold text-gray-700">${userBudget.toLocaleString()}</p>
            </div>
          </div>
          <div className={`text-sm font-semibold ${withinBudget ? 'text-teal-700' : 'text-orange-700'}`}>
            {withinBudget
              ? `✓ Saves you $${difference.toLocaleString()} under budget`
              : `⚠ $${difference.toLocaleString()} over your budget`}
          </div>
        </div>

        {/* Per person */}
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl bg-gray-50 p-3 text-center border border-gray-100">
            <p className="text-xs text-gray-500">Per Person</p>
            <p className="text-lg font-bold text-gray-800">${perPerson.toLocaleString()}</p>
          </div>
          <div className="flex-1 rounded-xl bg-gray-50 p-3 text-center border border-gray-100">
            <p className="text-xs text-gray-500">Per Day (couple)</p>
            <p className="text-lg font-bold text-gray-800">${Math.round(budget.total / 7).toLocaleString()}</p>
          </div>
        </div>

        {/* Category bars */}
        <div className="space-y-3">
          {categories.map(cat => {
            const amount = budget[cat.key];
            const pct = Math.round((amount / budget.total) * 100);
            return (
              <div key={cat.key}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-800">${amount.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 ml-1">{pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 text-center pt-1">
          * Prices are estimates in USD. Actual costs may vary by season and booking timing.
        </p>
      </div>
    </div>
  );
}
