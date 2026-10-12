import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {useLook} from '../look';
import {Caption, Speed} from '../parts';
import {Card, Phone, Pill, Swap, TwoUp, useTwoUp} from './phone';
import {RENDER, SPOT, STILL, TAKE} from './takes';

const still = (src: string) => <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'fill', display: 'block'}} />;

/** The material that went in with the photo, as the app shows it: its swatch, its name, its maker. */
const Material: React.FC<{at: number}> = ({at}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        left: 22,
        bottom: 22,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '10px 22px 10px 10px',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.94)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        opacity: t,
        transform: `translateY(${(1 - t) * 16}px)`,
        fontFamily: look.fonts.body,
      }}
    >
      <Img src={staticFile('stills/abruzzo.png')} style={{width: 64, height: 64, borderRadius: 10}} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
        <div style={{fontSize: 26, fontWeight: 700, color: '#111'}}>Abruzzo Oak</div>
        <div style={{fontSize: 21, color: '#666'}}>Jennings · SK3302 → cabinets</div>
      </div>
    </div>
  );
};

// RESTYLE: the real moment. A line drawing and a laminate from the catalogue go into one message,
// with a sentence typed on the phone; the render comes back live. Take B, cut down: the photo
// (10.7 s), Abruzzo Oak (50.4 s), the typing (58-60 s), Send (64.2 s), the wait at 7x, the render (83.1 s: 19 s after Send).
export const Restyle: React.FC = () => {
  const {cardWidth} = useTwoUp();
  const h = (cardWidth * RENDER.height) / RENDER.width;
  return (
    <TwoUp
      phone={
        <Phone
          src={TAKE.restyle}
          cuts={[
            {from: 0, at: 9.4},
            {from: 50, at: 49.2},
            {from: 118, at: 58.0},
            {from: 190, at: 63.6},
            {from: 222, at: 66.0, speed: 7},
            {from: 258, at: 82.4},
          ]}
          taps={[
            {...SPOT.photoTile, at: 39},
            {...SPOT.abruzzo, at: 86},
            {...SPOT.addMaterial, at: 110},
            {...SPOT.send, at: 208},
          ]}
        />
      }
      card={
        <Card width={cardWidth} height={h} at={14}>
          <Swap
            items={[
              {at: 0, node: still(STILL.drawing)},
              {at: 279, node: still(STILL.day)},
            ]}
          />
          <Sequence from={0} durationInFrames={281} layout="none">
            <Material at={92} />
          </Sequence>
          <Sequence from={279} layout="none">
            <Pill style={{left: 22, bottom: 22}}>After · 19 s</Pill>
          </Sequence>
        </Card>
      }
    >
      <Caption eyebrow="Chat" title="A photo and" accent="a real material." start={8} exit={112} />
      <Caption title="Then say" accent="what you want." start={124} exit={214} />
      <Caption title="A real render," accent="not a mock-up." start={232} />
      <Sequence from={222} durationInFrames={36} layout="none">
        <AbsoluteFill>
          <Speed label="7× speed" />
        </AbsoluteFill>
      </Sequence>
    </TwoUp>
  );
};

/** A blue outline round the card while it is the picture being replied to, as the app draws it. */
const Replying: React.FC<{until: number}> = ({until}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const t = interpolate(frame, [10, 22, until, until + 10], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{boxShadow: `inset 0 0 0 6px ${look.accent}`, opacity: t}} />;
};

// REPLY: carry on from one picture. "Continue in chat" quotes the render above the composer, a
// few words go after it, and the same room comes back at dusk. Take B, 134-171 s.
export const Reply: React.FC = () => {
  const {cardWidth} = useTwoUp();
  const h = (cardWidth * RENDER.height) / RENDER.width;
  return (
    <TwoUp
      phone={
        <Phone
          src={TAKE.restyle}
          cuts={[
            {from: 0, at: 134.3},
            {from: 45, at: 144.8},
            {from: 126, at: 148.4, speed: 7},
            {from: 186, at: 167.2},
          ]}
          taps={[{x: 366, y: 807, at: 120}]}
        />
      }
      card={
        <Card width={cardWidth} height={h} at={4}>
          <Swap
            items={[
              {at: 0, node: still(STILL.day)},
              {at: 207, node: still(STILL.evening)},
            ]}
          />
          <Replying until={196} />
          <Sequence from={207} layout="none">
            <Pill style={{left: 22, bottom: 22}}>Evening with the lamps on</Pill>
          </Sequence>
        </Card>
      }
    >
      <Caption eyebrow="Reply" title="Reply to" accent="any picture." start={8} exit={150} />
      <Caption title="Same room," accent="lamps on." start={196} />
      <Sequence from={126} durationInFrames={60} layout="none">
        <AbsoluteFill>
          <Speed label="7× speed" />
        </AbsoluteFill>
      </Sequence>
    </TwoUp>
  );
};
