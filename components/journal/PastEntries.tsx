import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../Card';
import { JournalIcon } from '../icons/JournalIcon';
import { SunIcon } from '../icons/SunIcon';
import { MoonIcon } from '../icons/MoonIcon';
import { SparkleIcon } from '../icons/SparkleIcon';
import { PrayingHandsIcon } from '../icons/PrayingHandsIcon';
import { HeartIcon } from '../icons/HeartIcon';
import { StarIcon } from '../icons/StarIcon';
import { ImageIcon } from '../icons/ImageIcon';
import { CrossIcon } from '../icons/CrossIcon';
import { Role, Feeling, Reflection } from '../../types';

const feelingsToText = (feelings: (string[] | Feeling[])) => {
  if (!feelings || feelings.length === 0) return '';
  if (typeof (feelings as any[])[0] === 'string') {
    return (feelings as string[]).slice(0, 3).join(', ');
  }
  return (feelings as Feeling[]).slice(0, 3).map(f => f.label).join(', ');
};

const Pill: React.FC<{ text: string }> = ({ text }) => (
  <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">{text}</span>
);

const EntryRow: React.FC<{ r: Reflection }>= ({ r }) => {
  const [open, setOpen] = useState(false);
  const subtitleParts: string[] = [];
  const feelings = feelingsToText(r.feelings);
  if (feelings) subtitleParts.push(feelings);
  if (r.gratitude) subtitleParts.push(`Grateful: ${r.gratitude.slice(0, 40)}${r.gratitude.length > 40 ? '…' : ''}`);
  if (r.intention) subtitleParts.push(`Intent: ${r.intention.slice(0, 40)}${r.intention.length > 40 ? '…' : ''}`);
  if (r.evening?.rating) subtitleParts.push(`Evening ★${r.evening.rating}`);
  if (r.evening?.highlight) subtitleParts.push(`Highlight: ${r.evening.highlight.slice(0, 40)}${r.evening.highlight.length > 40 ? '…' : ''}`);

  const formattedDate = new Date(r.date.replace(/-/g,'/')).toLocaleDateString();
  const feelingLabels: string[] = Array.isArray(r.feelings)
    ? (typeof (r.feelings as any[])[0] === 'string'
        ? (r.feelings as string[])
        : (r.feelings as Feeling[]).map(f => f.label))
    : [];

  const stars = (r.evening?.rating || 0);

  return (
    <div className="py-3 border-b border-slate-200/60 last:border-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-indigo-900">{formattedDate}{r.userName ? ` — ${r.userName}` : ''}</div>
          {subtitleParts.length > 0 && (
            <div className="text-xs text-slate-600 mt-0.5">{subtitleParts.join(' · ')}</div>
          )}
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="px-2 py-1 text-xs font-semibold rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          {open ? 'Hide' : 'View details'}
        </button>
      </div>

      {open && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
          {/* Morning Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 font-semibold"><SunIcon className="w-4 h-4 text-amber-500" /> Morning</div>
            {feelingLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {feelingLabels.map((t, i) => <Pill key={i} text={t} />)}
              </div>
            )}
            {(r.godRelationship?.length || 0) > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-700"><CrossIcon className="w-4 h-4 text-indigo-500" /> {r.godRelationship.join(', ')}</div>
            )}
            {(r.partnerRelationship?.length || 0) > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-700"><HeartIcon className="w-4 h-4 text-rose-500" /> {r.partnerRelationship.join(', ')}</div>
            )}
            {r.prayerRequest && (
              <div className="flex items-start gap-2 text-sm text-slate-700"><PrayingHandsIcon className="w-4 h-4 text-indigo-500 mt-0.5" /><span>{r.prayerRequest}</span></div>
            )}
            {r.gratitude && (
              <div className="flex items-start gap-2 text-sm text-slate-700"><SparkleIcon className="w-4 h-4 text-amber-500 mt-0.5" /><span>{r.gratitude}</span></div>
            )}
            {r.intention && (
              <div className="flex items-start gap-2 text-sm text-slate-700"><HeartIcon className="w-4 h-4 text-rose-500 mt-0.5" /><span>{r.intention}</span></div>
            )}
            {r.imageUrl && (
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <a className="text-indigo-700 hover:underline" href={r.imageUrl} target="_blank" rel="noreferrer">View photo</a>
              </div>
            )}
          </div>

          {/* Evening Section */}
          {r.evening && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-indigo-900 font-semibold"><MoonIcon className="w-4 h-4 text-indigo-500" /> Evening</div>
              {stars > 0 && (
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <StarIcon key={i} className={`w-4 h-4 ${i <= stars ? 'text-yellow-400' : 'text-slate-300'}`} />
                  ))}
                </div>
              )}
              {r.evening.sawGod?.options?.length ? (
                <div className="text-sm text-slate-700">Saw God: {r.evening.sawGod.options.join(', ')}</div>
              ) : null}
              {r.evening.sawGod?.note && (
                <div className="text-sm text-slate-700">{r.evening.sawGod.note}</div>
              )}
              {r.evening.apology?.options?.length ? (
                <div className="text-sm text-slate-700">Apology: {r.evening.apology.options.join(', ')}</div>
              ) : null}
              {r.evening.apology?.note && (
                <div className="text-sm text-slate-700">{r.evening.apology.note}</div>
              )}
              {r.evening.highlight && (
                <div className="text-sm text-slate-700">Highlight: {r.evening.highlight}</div>
              )}
              {r.evening.inWord !== undefined && (
                <div className="text-sm text-slate-700">In the Word: {r.evening.inWord ? 'Yes' : 'No'}</div>
              )}
              {r.evening.scripture?.passage && (
                <div className="text-sm text-slate-700">Scripture: {r.evening.scripture.passage}</div>
              )}
              {r.evening.heartTakeaways?.options?.length ? (
                <div className="text-sm text-slate-700">Takeaways: {r.evening.heartTakeaways.options.join(', ')}</div>
              ) : null}
              {r.evening.heartTakeaways?.note && (
                <div className="text-sm text-slate-700">{r.evening.heartTakeaways.note}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const PastEntries: React.FC<{ activeRole: Role }>= ({ activeRole }) => {
  const { reflections } = useAuth();
  const [limit, setLimit] = useState(14);

  const pastEntries = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let list = (reflections || []).filter(r => r.date !== today);
    // Filter by person if a specific role is selected
    if (activeRole !== 'Shared') {
      const roleLower = activeRole.toLowerCase();
      list = list.filter(r => {
        const name = (r.userName || '').toLowerCase();
        // If entry has no name, include it; otherwise filter by role match
        return !name || name.includes(roleLower);
      });
    }
    const toMs = (d: string) => new Date(d.replace(/-/g,'/')).getTime();
    return list.sort((a,b) => toMs(b.date) - toMs(a.date)).slice(0, limit);
  }, [reflections, limit, activeRole]);

  if (activeRole === 'Shared') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Past Entries — Austin" icon={<JournalIcon className="w-6 h-6" /> }>
          <div>
            {pastEntries.filter(r => (r.userName||'').toLowerCase().includes('austin')).length === 0 ? (
              <div className="text-sm text-slate-600">No entries yet for Austin.</div>
            ) : (
              pastEntries.filter(r => (r.userName||'').toLowerCase().includes('austin')).map(r => (
                <EntryRow key={r.id || `${r.userId}_${r.date}`} r={r} />
              ))
            )}
          </div>
        </Card>
        <Card title="Past Entries — Angie" icon={<JournalIcon className="w-6 h-6" /> }>
          <div>
            {pastEntries.filter(r => (r.userName||'').toLowerCase().includes('angie')).length === 0 ? (
              <div className="text-sm text-slate-600">No entries yet for Angie.</div>
            ) : (
              pastEntries.filter(r => (r.userName||'').toLowerCase().includes('angie')).map(r => (
                <EntryRow key={r.id || `${r.userId}_${r.date}`} r={r} />
              ))
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card title={`Past Entries — ${activeRole}`} icon={<JournalIcon className="w-6 h-6" /> }>
      <div>
        {pastEntries.length === 0 ? (
          <div className="text-sm text-slate-600">No past entries yet. Recent reflections will appear here.</div>
        ) : (
          <div>
            {pastEntries.map(r => (
              <EntryRow key={r.id || `${r.userId}_${r.date}`} r={r} />
            ))}
            {reflections.length > pastEntries.length && (
              <div className="mt-3">
                <button onClick={() => setLimit(l => l + 14)} className="text-sm font-semibold text-indigo-700 hover:underline">Load more</button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
