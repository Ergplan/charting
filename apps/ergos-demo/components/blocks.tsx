'use client';
import { ReactNode, useEffect, useRef } from 'react';
import { useErgOS } from '@/lib/ergos';
import { Icon, Chip, MiniBars } from './ui';
import { TIMELINE } from '@/lib/demo';

/** The signature green glass folder. Pass up to three sheets (kicker, label, value). */
export function Folder({ title, sub, sheets, children, onFolder, className, style }: {
  title: string; sub?: string; sheets?: { kicker: string; label: string; value: string; more?: [string, string]; q?: boolean }[];
  children?: ReactNode; onFolder?: boolean; className?: string; style?: React.CSSProperties;
}) {
  const front = useRef<HTMLDivElement>(null);
  const E = useErgOS();
  useEffect(() => { if (E && front.current) E.folder(front.current); }, [E]);
  return (
    <div className={`eg-folder ${className || ''}`} style={style}>
      <div className="eg-folder__back" />
      {sheets && (
        <div className="eg-folder__sheets" aria-hidden="true">
          {sheets.map((s) => (
            <div className="eg-sheet" key={s.kicker}>
              <div className="eg-sheet__kicker">{s.kicker}{s.q && <span className="eg-sheet__q">?</span>}</div>
              {s.label}<b>{s.value}</b>
              {s.more && <><div style={{ marginTop: 10 }}>{s.more[0]}</div><b>{s.more[1]}</b></>}
            </div>
          ))}
        </div>
      )}
      <div className={`eg-folder__front${onFolder ? ' eg-on-folder' : ''}`} ref={front}>
        <div className="eg-folder__head"><h2 className="eg-folder__title">{title}</h2>{sub && <p className="eg-folder__sub">{sub}</p>}</div>
        {children}
      </div>
    </div>
  );
}

export function Timeline() {
  return (
    <div className="eg-timeline">
      {TIMELINE.map((it) => (
        <div className="eg-tl-item" key={it.title}>
          <span className="eg-tl-item__icon"><Icon name={it.icon} size={20} /></span>
          <div><h4 className="eg-tl-item__title">{it.title}</h4><p className="eg-tl-item__meta">{it.meta}</p></div>
          <div className="eg-tl-card">
            <span className="eg-tl-card__app"><Icon name={it.card.icon} size={22} /></span>
            <div>
              <h5 className="eg-tl-card__title">{it.card.title}</h5>
              <div className="eg-tl-card__who">
                {'avatars' in it.card && <span className="eg-avatars">{it.card.avatars.map((a) => <span className="eg-avatar" key={a}>{a}</span>)}</span>}
                {'chip' in it.card && <Chip tone="warning">{it.card.chip}</Chip>}
                {it.card.who}
              </div>
            </div>
            <div className="eg-tl-card__body">
              <div className="eg-thumbs">{it.card.thumbs.map(([lab, vals]) => <div className="eg-thumb" key={lab}><span>{lab}</span><MiniBars values={vals} /></div>)}</div>
              <Chip time>{it.card.time}</Chip>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** AI real talk. Without onMic it plays the scripted demo. */
export function VoiceBar({ state = 'idle', text = 'Ask anything', compact, demo = true, question, answer }: {
  state?: 'idle' | 'listening' | 'thinking' | 'speaking'; text?: string; compact?: boolean; demo?: boolean; question?: string; answer?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const E = useErgOS();
  useEffect(() => {
    if (!E || !el.current) return;
    const v = E.voiceBar(el.current, { demo, question, answer });
    return () => v.stop();
  }, [E, demo, question, answer]);
  return (
    <div className={`eg-voice${compact ? ' eg-voice--compact' : ''}`} data-state={state} ref={el}>
      <span className="eg-voice__orb" aria-hidden="true"><i /></span>
      <div className="eg-voice__body"><div className="eg-voice__text" aria-live="polite">{text}</div><div className="eg-voice__wave" aria-hidden="true"><canvas /></div></div>
      <span className="eg-voice__timer">0:00</span>
      <button className="eg-icon-btn eg-icon-btn--sm" data-voice="keyboard" aria-label="Type instead" style={{ background: 'transparent', borderColor: 'transparent', boxShadow: 'none' }}><Icon name="keyboard" /></button>
      <button className="eg-voice__mic" data-voice="mic" aria-label="Start talking"><span className="i-mic"><Icon name="mic" size={20} /></span><span className="i-stop"><Icon name="stop" size={18} /></span><span className="i-spin" /></button>
    </div>
  );
}
