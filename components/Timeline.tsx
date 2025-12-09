import React, { useState } from 'react';
import { TimelineEvent } from '../types';
import { Star, Heart, Baby, Sun, Award, ChevronDown, X } from 'lucide-react';

interface TimelineProps {
  events: TimelineEvent[];
  onInteract: (x: number, y: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({ events, onInteract }) => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case 'baby': return <Baby className="w-5 h-5 text-white" />;
      case 'heart': return <Heart className="w-5 h-5 text-white" />;
      case 'sun': return <Sun className="w-5 h-5 text-white" />;
      case 'award': return <Award className="w-5 h-5 text-white" />;
      default: return <Star className="w-5 h-5 text-white" />;
    }
  };

  const handleOpen = (e: React.MouseEvent, event: TimelineEvent) => {
    onInteract(e.clientX, e.clientY);
    setSelectedEvent(event);
  };

  return (
    <div className="relative container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-3xl font-serif text-center mb-12 text-stone-800">Uma Jornada de Bênçãos</h2>
      
      {/* Vertical Line */}
      <div className="absolute left-4 md:left-1/2 top-32 bottom-12 w-0.5 bg-stone-300 transform md:-translate-x-1/2"></div>

      <div className="space-y-12">
        {events.map((event, index) => (
          <div 
            key={event.id} 
            className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
          >
            {/* Dot/Icon */}
            <div className="absolute left-4 md:left-1/2 w-10 h-10 rounded-full bg-gold-500 border-4 border-white shadow-md flex items-center justify-center transform md:-translate-x-1/2 z-10 shrink-0">
              {getIcon(event.iconType)}
            </div>

            {/* Content Spacer for layout balance */}
            <div className="hidden md:block w-1/2"></div>

            {/* Card */}
            <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
              <div 
                className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={(e) => handleOpen(e, event)}
              >
                <h3 className="text-xl font-serif font-bold text-stone-800 mb-2 group-hover:text-gold-600 transition-colors">
                  {event.title}
                </h3>
                <p className="text-stone-600 line-clamp-2">{event.description}</p>
                <div className="mt-4 flex items-center text-gold-600 text-sm font-medium">
                  Ver detalhes <ChevronDown className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="mb-6">
              <span className="text-gold-600 font-bold text-lg">{selectedEvent.year}</span>
              <h2 className="text-3xl font-serif font-bold text-stone-900 mt-1">{selectedEvent.title}</h2>
            </div>
            <div className="prose prose-stone">
              <p className="text-lg leading-relaxed text-stone-600 whitespace-pre-line">
                {selectedEvent.details}
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-stone-100 text-center">
              <p className="italic text-stone-500 font-serif">"Até aqui nos ajudou o Senhor."</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;