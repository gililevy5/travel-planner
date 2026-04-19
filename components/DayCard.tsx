'use client';

import { useState } from 'react';
import { DayPlan, Activity } from '@/lib/types';

interface DayCardProps {
  day: DayPlan;
  travelers: number;
}

const typeIcons: Record<Activity['type'], string> = {
  food: '🍽️',
  nature: '🌿',
  culture: '🏛️',
  transport: '🚌',
  accommodation: '🏨',
  leisure: '⭐',
  adventure: '🏔️',
};

const typeColors: Record<Activity['type'], string> = {
  food: 'bg-amber-50 border-amber-200 text-amber-900',
  nature: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  culture: 'bg-purple-50 border-purple-200 text-purple-900',
  transport: 'bg-blue-50 border-blue-200 text-blue-900',
  accommodation: 'bg-gray-50 border-gray-200 text-gray-900',
  leisure: 'bg-rose-50 border-rose-200 text-rose-900',
  adventure: 'bg-orange-50 border-orange-200 text-orange-900',
};

const typeLabels: Record<Activity['type'], string> = {
  food: 'Food & Dining',
  nature: 'Nature',
  culture: 'Culture',
  transport: 'Transport',
  accommodation: 'Accommodation',
  leisure: 'Leisure',
  adventure: 'Adventure',
};

function ActivityItem({ activity, travelers }: { activity: Activity; travelers: number }) {
  const colorClass = typeColors[activity.type];
  const icon = typeIcons[activity.type];
  const totalCost = activity.cost * travelers;

  return (
    <div className={`flex gap-3 rounded-xl border p-3.5 ${colorClass} transition-all`}>
      {/* Time */}
      <div className="shrink-0 w-14 text-right">
        <span className="text-xs font-bold opacity-70">{activity.time}</span>
      </div>

      {/* Dot connector */}
      <div className="shrink-0 flex flex-col items-center">
        <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-sm shadow-sm border border-white">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm leading-tight">{activity.name}</h4>
          {totalCost > 0 ? (
            <span className="text-xs font-bold shrink-0 opacity-80">
              ${totalCost}
            </span>
          ) : (
            <span className="text-xs font-bold shrink-0 text-emerald-600">Free</span>
          )}
        </div>
        <p className="text-xs opacity-70 mt-0.5 leading-relaxed">{activity.description}</p>
        <div className="flex gap-3 mt-1.5">
          <span className="text-xs opacity-60">⏱ {activity.duration}</span>
          <span className="text-xs opacity-50">•</span>
          <span className="text-xs opacity-60">{typeLabels[activity.type]}</span>
        </div>
      </div>
    </div>
  );
}

export default function DayCard({ day, travelers }: DayCardProps) {
  const [open, setOpen] = useState(day.day === 1);
  const dayTotal = day.activities.reduce((sum, a) => sum + a.cost * travelers, 0);

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow">
            {day.day}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900 text-sm">{day.title}</h3>
            <p className="text-xs text-gray-500">{day.location} • {day.activities.length} activities</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">${dayTotal} / couple</span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="bg-gray-50 border-t border-gray-100 p-4">
          <div className="space-y-2.5">
            {day.activities.map((activity, i) => (
              <ActivityItem key={i} activity={activity} travelers={travelers} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
