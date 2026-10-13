'use client';
import { Shell } from '@/components/Shell';
import { Button, IconButton, Icon, Track } from '@/components/ui';
import { Folder, Timeline, VoiceBar } from '@/components/blocks';
import './mobile.css';

function Status() {
  return <div className="m-status"><span>9:41</span><span className="m-island" /><span className="m-icons"><Icon name="bars" size={15} /><Icon name="antenna" size={15} /><i /></span></div>;
}

export default function MobilePage() {
  return (
    <Shell crumb="Mobile">
      <div className="m-stage">
        <div className="m-phone"><div className="m-screen eg-dots">
          <Status />
          <div className="m-ob">
            <div className="m-art">
              <svg className="m-links" viewBox="0 0 390 300" aria-hidden="true"><path d="M110 100 V230 Q110 242 122 242 H150" /><path d="M300 136 V184 Q300 196 288 196 H264" /><path d="M40 190 Q40 280 120 280 H172 V258" /></svg>
              <div className="m-node" style={{ left: 70, top: 34 }}>Grid<b>22.65 MWh</b><span className="m-tag"><Icon name="grid" size={14} /></span></div>
              <div className="m-node" style={{ left: 246, top: 76 }}>Solar<b>3.11 MWh</b><span className="m-tag"><Icon name="solar" size={14} /></span></div>
              <div className="m-node" style={{ left: 14, top: 138 }}>IEX<b>17.66 MWh</b><span className="m-tag g"><Icon name="exchange" size={14} /></span></div>
              <img className="m-orb" src="/brand/joulewise-mark.svg" alt="" />
            </div>
            <VoiceBar compact state="listening" text="Plan the first bid for C1" demo={false} />
            <div style={{ marginTop: 'auto' }}>
              <h1 className="m-h1">Ready to take <em>control</em> of tomorrow?</h1>
              <p className="muted" style={{ margin: '8px 0 20px', fontSize: 14 }}>Plan T+1 bids for all 8 plants in one place.</p>
              <Button variant="primary" size="lg" block>Set up auto-trading</Button>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
                <nav className="eg-dock m-dock" aria-label="Primary"><a href="#" aria-current="page"><Icon name="factory" size={17} />Plants</a><a href="#"><Icon name="apps" size={17} />Desk</a><a href="#"><Icon name="bolt" size={17} />Launch</a></nav>
              </div>
            </div>
          </div>
        </div></div>

        <div className="m-phone"><div className="m-screen">
          <Status />
          <div className="m-top"><IconButton icon="arrow-left" label="Back" /><div><IconButton icon="message" label="Comment" /><IconButton icon="file" label="Report" /><IconButton icon="download" label="Download" /></div></div>
          <div className="m-folder">
            <Folder title="Trading desk" sub="Recent activity" onFolder
              sheets={[{ kicker: 'Incident', label: 'Block', value: '44–45' }, { kicker: 'Schedule', label: 'Revision', value: 'R2' }, { kicker: 'DAM bid', label: 'Cleared', value: '2,716 kW', more: ['Price', '₹5.33'], q: true }]}>
              <Track value={62} left="T+1 bid · C1" right="IEX clearing" style={{ margin: '18px 0 22px' }} />
              <Timeline />
            </Folder>
          </div>
        </div></div>
      </div>
    </Shell>
  );
}
