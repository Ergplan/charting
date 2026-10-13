'use client';
import { Shell } from '@/components/Shell';
import { Chip, Icon } from '@/components/ui';
import { VoiceBar } from '@/components/blocks';

export default function RealTalkPage() {
  return (
    <Shell crumb="Real talk">
      <div className="two">
        <section className="eg-talk">
          <div className="eg-talk__head"><h3 className="eg-talk__title"><Icon name="sparkle" size={20} />Real talk</h3><Chip tone="accent" live>HALDIRAM C1 · live data</Chip></div>
          <div className="eg-msg eg-msg--me">Why did demand dip at eleven today?<div className="eg-msg__meta"><Icon name="mic" size={12} />Spoken · 0:04</div></div>
          <div className="eg-msg eg-msg--ai"><span className="eg-msg__orb" /><div>Demand fell to <b>2,120 kW</b> in blocks 44 and 45 during the lunch shutdown. With 2,716 kW cleared on IEX, about <b>596 kW</b> was surplus for 30 minutes.
            <div className="eg-msg__chips"><Chip tone="warning">Deviation · Blocks 44–45</Chip><Chip icon="exchange">IEX ₹5.33 / kWh</Chip><Chip tone="accent">Trim 600 kW tomorrow</Chip></div>
            <div className="eg-msg__meta"><Icon name="volume" size={12} />Spoken reply · 0:12</div></div></div>
          <VoiceBar text="Tap the mic and ask anything" />
          <p className="muted" style={{ fontSize: 13 }}>The mic plays a scripted demo here. In ergOS it calls the speech service: see docs/HARMONY.md § Voice bar.</p>
        </section>
        <div className="eg-stack" style={{ gap: 18 }}>
          {([['Idle', 'idle', 'Ask anything'], ['Listening', 'listening', 'Which blocks should we buy tomorrow'], ['Thinking', 'thinking', 'Reading 7 days of blocks…'], ['Speaking', 'speaking', 'Buy blocks 36 to 61 at about 2,700 kW. Skip 44 and 45, demand drops there at lunch.']] as const).map(([lab, st, txt]) => (
            <div key={st}><p className="eg-voice-label">{lab}</p><VoiceBar state={st} text={txt} demo={false} /></div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
