import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../backdrop';
import {Kinetic} from '../library';
import {useBrand, useLook} from '../look';
import {Pop} from '../parts';
import {Icon, wordmark} from './Logo';

// END: the ask, big and held: what it is, and where to get it.
export const End: React.FC = () => {
  const look = useLook();
  const brand = useBrand();
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26, padding: `0 ${look.safe.right}px 0 ${look.safe.left}px`}}>
        <div style={{display: 'flex', flexDirection: look.tall ? 'column' : 'row', alignItems: 'center', gap: 26}}>
          <Icon size={120} land={0} />
          <Kinetic text={brand.name} start={10} effect="rise" style={wordmark(look, 100)} />
        </div>
        <Kinetic
          text="Your agents keep working."
          accent="Even when you walk away."
          start={24}
          stagger={4}
          align="center"
          style={{fontSize: Math.round(look.size * 0.84), maxWidth: 1500}}
        />
        <Pop
          start={70}
          style={{
            marginTop: 18,
            padding: '18px 34px',
            borderRadius: 999,
            background: look.accentSoft,
            fontFamily: look.fonts.body,
            fontSize: 38,
            fontWeight: 700,
            color: look.accentText,
          }}
        >
          Free beta · {brand.url}
        </Pop>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
