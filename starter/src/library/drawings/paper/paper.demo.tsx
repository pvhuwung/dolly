import React from 'react';
import type {Demo} from '../../types';
import {InArea, useArea} from '../_demo';
import {Flower} from '../flower/flower';
import {HexField} from '../hex-field/hex-field';
import {Stamps} from '../stamps/stamps';
import {Paper} from './paper';

const PaperDemo: React.FC = () => {
  const a = useArea();
  // Three cards, overlapping more where the frame is narrow.
  const overlap = a.look.tall ? 0.2 : 0.08;
  const w = Math.min(a.w / (3 - 2 * overlap), a.w * 0.3 + (a.look.tall ? a.w : 0), 470);
  const h = Math.min(w * 1.3, a.h * 0.92);
  const gap = -w * overlap;
  return (
    <InArea>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <Paper width={Math.round(w)} height={Math.round(h)} rotate={-6} start={0} style={{marginRight: gap, zIndex: 1}}>
          <Stamps width={w * 0.84} height={h * 0.86} count={14} start={14} stagger={2} />
        </Paper>
        <Paper width={Math.round(w)} height={Math.round(h)} rotate={2} start={6} style={{zIndex: 2, marginTop: -h * 0.06}} seed={3}>
          <Flower size={w * 0.62} start={18} frames={60} />
        </Paper>
        <Paper width={Math.round(w)} height={Math.round(h)} rotate={7} start={12} style={{marginLeft: gap, zIndex: 1}} seed={5}>
          <HexField width={w * 0.86} height={h * 0.86} radius={w / 17} start={22} frames={40} />
        </Paper>
      </div>
    </InArea>
  );
};

export const demos: Demo[] = [
  {name: 'Paper cards', code: '<Paper width={420} height={540} rotate={-6}>{drawing}</Paper>', seconds: 3.5, hero: 96, Component: PaperDemo},
];
