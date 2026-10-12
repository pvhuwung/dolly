import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile} from 'remotion';
import {useLook} from '../look';
import {Caption, Speed} from '../parts';
import {Card, Feed, Phone, TwoUp, useTwoUp} from './phone';
import {REGION, SPOT, STILL, TAKE} from './takes';

// EXPLORE: a style straight into concepts. Japandi (0.3 s) → Explore concepts → four concepts, made
// live (30 s) → the prompt library (48 s). Take F. The shot opens on the phone alone and pans to the
// four pictures when they land.
export const Explore: React.FC = () => {
  const look = useLook();
  const {cardWidth} = useTwoUp();
  const gap = 14;
  const cell = (cardWidth - gap) / 2;
  const cellH = (cell * 896) / 1200;
  return (
    <TwoUp
      reveal={136}
      phone={
        <Phone
          src={TAKE.explore}
          cuts={[
            {from: 0, at: 0.0},
            {from: 42, at: 9.0},
            {from: 75, at: 11.0, speed: 8},
            {from: 117, at: 29.3},
            {from: 196, at: 48.2},
          ]}
          taps={[{...SPOT.japandi, at: 9}]}
        />
      }
      card={
        <div style={{display: 'grid', gridTemplateColumns: `${cell}px ${cell}px`, gap}}>
          {STILL.japandi.map((src, i) => (
            <Card key={src} width={cell} height={cellH} at={146 + i * 5}>
              <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
              <div
                style={{
                  position: 'absolute',
                  left: 14,
                  top: 14,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.92)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: look.fonts.body,
                  fontWeight: 700,
                  fontSize: 22,
                  color: '#111',
                }}
              >
                {i + 1}
              </div>
            </Card>
          ))}
        </div>
      }
    >
      <Caption eyebrow="Explore" title="Start from" accent="a style." start={8} exit={128} />
      <Caption title="Four concepts," accent="one tap." start={142} exit={190} />
      <Caption eyebrow="Prompt library" title="Proven wording," accent="built in." start={200} />
      <Sequence from={75} durationInFrames={42} layout="none">
        <AbsoluteFill>
          <Speed label="8× speed" />
        </AbsoluteFill>
      </Sequence>
    </TwoUp>
  );
};

// PLANS: the floor plans from spacejot.ai, on the phone: one in 2D, then in 3D, turned and zoomed
// by the app's own Plans tour. Take E. The card beside it is the same feed, cut close on the model.
export const Plans: React.FC = () => {
  const look = useLook();
  const cuts = [
    {from: 0, at: 19.2},
    {from: 45, at: 24.4, speed: 1.3},
  ];
  const width = Math.min(900, ((look.height - look.band - look.safe.bottom) * REGION.plan3d.width) / REGION.plan3d.height);
  const height = (width * REGION.plan3d.height) / REGION.plan3d.width;
  return (
    <TwoUp
      phone={<Phone src={TAKE.plans} cuts={cuts} />}
      card={
        <Card width={width} height={height} at={50}>
          <AbsoluteFill style={{background: '#fff'}}>
            <Feed src={TAKE.plans} cuts={cuts} crop={REGION.plan3d} />
          </AbsoluteFill>
        </Card>
      }
    >
      <Caption eyebrow="Plans" title="Your floor plans," accent="in 3D." start={8} />
    </TwoUp>
  );
};

// BOARD: the pictures for a client on one branded page. Four selected in the Library, Make a client
// board (29.7 s), a title typed (42-44 s). Take D. The card is the board's live preview, cut close.
export const Board: React.FC = () => {
  const look = useLook();
  const cuts = [
    {from: 0, at: 20.4},
    {from: 36, at: 29.2},
    {from: 66, at: 31.8},
    {from: 96, at: 41.6},
  ];
  const height = look.height - look.band - look.safe.bottom - 20;
  const width = (height * REGION.board.width) / REGION.board.height;
  return (
    <TwoUp
      phone={<Phone src={TAKE.board} cuts={cuts} taps={[{...SPOT.makeBoard, at: 51}]} />}
      card={
        <Card width={width} height={height} at={72}>
          <AbsoluteFill style={{background: '#fff'}}>
            <Feed src={TAKE.board} cuts={cuts} crop={REGION.board} />
          </AbsoluteFill>
        </Card>
      }
    >
      <Caption eyebrow="Share" title="One board" accent="for your client." start={8} />
    </TwoUp>
  );
};
