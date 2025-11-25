import React from 'react';
import { ParsedEvent } from '../types';
import { generateGoogleCalendarLink } from '../utils/calendar';
import { Calendar, MapPin, Info, ExternalLink } from 'lucide-react';

interface EventCardProps {
  event: ParsedEvent;
  index: number;
}

export const EventCard: React.FC<EventCardProps> = ({ event, index }) => {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border-b border-indigo-100 flex justify-between items-start">
        <div>
          <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700 mb-1">
             課程 {index + 1}
          </span>
          <h3 className="text-lg font-bold text-slate-800 leading-tight">{event.title}</h3>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* Time */}
        <div className="flex items-start gap-3">
            <div className="mt-1 min-w-5">
                <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-900">{formatDate(startDate)}</p>
                <p className="text-sm text-slate-600">
                    {formatTime(startDate)} - {formatTime(endDate)}
                </p>
            </div>
        </div>

        {/* Location */}
        {event.location && (
            <div className="flex items-start gap-3">
                <div className="mt-1 min-w-5">
                    <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                <div className="overflow-hidden">
                    <a href={event.location} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                        Zoom 會議連結
                    </a>
                </div>
            </div>
        )}

        {/* Description */}
        {event.description && (
            <div className="flex items-start gap-3">
                 <div className="mt-1 min-w-5">
                    <Info className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {event.description}
                </p>
            </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
        <a 
            href={generateGoogleCalendarLink(event)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
            <ExternalLink className="w-4 h-4" />
            加入 Google 行事曆
        </a>
      </div>
    </div>
  );
};