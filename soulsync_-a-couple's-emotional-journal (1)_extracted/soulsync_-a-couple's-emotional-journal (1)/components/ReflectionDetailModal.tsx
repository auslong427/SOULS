import React from 'react';
import { Reflection } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { CrossIcon } from './icons/CrossIcon';
import { HeartIcon } from './icons/HeartIcon';
import { PrayingHandsIcon } from './icons/PrayingHandsIcon';
import { SparkleIcon } from './icons/SparkleIcon';

interface ReflectionDetailModalProps {
  reflection: Reflection;
  onClose: () => void;
}

const DetailSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div>
        <div className="flex items-center mb-2">
            <div className="text-sky-500 mr-2">{icon}</div>
            <h4 className="font-semibold text-slate-600">{title}</h4>
        </div>
        <div className="pl-6 text-sm text-slate-700">{children}</div>
    </div>
);

export const ReflectionDetailModal: React.FC<ReflectionDetailModalProps> = ({ reflection, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {reflection.userName}'s Reflection
            </h3>
            <p className="text-sm text-slate-500">
                {new Date(reflection.date.replace(/-/g, '/')).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="overflow-y-auto p-6 space-y-6">
            {reflection.imageUrl && (
                <img src={reflection.imageUrl} alt="Reflection memory" className="rounded-xl w-full h-auto object-cover max-h-80" />
            )}

            {reflection.feelings && reflection.feelings.length > 0 && (
                <DetailSection title="Feelings" icon={<SparkleIcon className="w-5 h-5 text-amber-500" />}>
                     <div className="flex flex-wrap gap-2">
                        {reflection.feelings.map(feeling => (
                            <span key={feeling} className="px-3 py-1 rounded-full text-sm font-medium bg-sky-100 text-sky-800">
                                {feeling}
                            </span>
                        ))}
                    </div>
                </DetailSection>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reflection.godRelationship && reflection.godRelationship.length > 0 && (
                    <DetailSection title="Relationship with God" icon={<CrossIcon className="w-5 h-5" />}>
                        <div className="flex flex-wrap gap-2">
                            {reflection.godRelationship.map(item => (
                                <span key={item} className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </DetailSection>
                )}
                {reflection.partnerRelationship && reflection.partnerRelationship.length > 0 && (
                     <DetailSection title="Relationship with Partner" icon={<HeartIcon className="w-5 h-5 text-rose-500" />}>
                        <div className="flex flex-wrap gap-2">
                            {reflection.partnerRelationship.map(item => (
                                <span key={item} className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </DetailSection>
                )}
            </div>

            {reflection.prayerRequest && (
                <DetailSection title="Prayer Requests" icon={<PrayingHandsIcon className="w-5 h-5" />}>
                     <p className="bg-slate-50 p-3 rounded-lg border">{reflection.prayerRequest}</p>
                </DetailSection>
            )}

            {reflection.gratitude && (
                <DetailSection title="Gratitude" icon={<SparkleIcon className="w-5 h-5" />}>
                    <p className="bg-slate-50 p-3 rounded-lg border">{reflection.gratitude}</p>
                </DetailSection>
            )}

            {reflection.intention && (
                <DetailSection title="Intention" icon={<HeartIcon className="w-5 h-5" />}>
                    <p className="bg-slate-50 p-3 rounded-lg border">{reflection.intention}</p>
                </DetailSection>
            )}

        </main>
      </div>
       <style>{`
            @keyframes animate-fade-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in {
                animation: animate-fade-in 0.2s ease-out forwards;
            }
        `}</style>
    </div>
  );
};