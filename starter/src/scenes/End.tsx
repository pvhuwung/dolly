import React from 'react';
import {AbsoluteFill} from 'remotion';
import {accentStyle, brand, fontFamily, serifFamily} from '../brand';
import {Words} from '../kit';
import {Pop} from '../parts';
import {Icon} from './Logo';

// END: the ask, big and held: what it is, and where to get it.
export const End: React.FC = () => (
  <AbsoluteFill style={{background: brand.background, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
      <Icon size={120} land={0} />
      <Words text={brand.name} start={10} style={{fontFamily, fontSize: 100, fontWeight: 700, color: brand.ink, letterSpacing: -3}} />
    </div>
    <div style={{display: 'flex', gap: 14}}>
      <Words text="Your agents keep working." start={24} stagger={4} style={{fontFamily: serifFamily, fontSize: 52, fontWeight: 600, color: brand.ink, letterSpacing: -1}} />
      <Words
        text="Even when you walk away."
        start={44}
        stagger={4}
        style={{fontFamily: serifFamily, fontSize: 52, fontWeight: 600, letterSpacing: -1}}
        wordStyle={accentStyle}
      />
    </div>
    <Pop at={70} style={{marginTop: 18, padding: '18px 34px', borderRadius: 999, background: brand.accentSoft, fontFamily, fontSize: 38, fontWeight: 700, color: brand.accentDeep}}>
      Free beta · {brand.url}
    </Pop>
  </AbsoluteFill>
);
