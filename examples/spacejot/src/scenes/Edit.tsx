import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile} from 'remotion';
import {Caption, Speed} from '../parts';
import {Card, Phone, Pill, Swap, TwoUp, useTwoUp} from './phone';
import {RENDER, SPOT, STILL, TAKE} from './takes';

const still = (src: string) => <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'fill', display: 'block'}} />;

// EDIT: the evening render in the editor. Empty room takes the furniture out (11.8 s, 12.8 s; ready at
// 42 s), then Bradford Beige from Nippon Paint goes on the walls (60.8 s, applied at 65.3 s, ready at
// 81 s). Take C. The second wait is cut, the first is shown sped up.
export const Edit: React.FC = () => {
  const {cardWidth} = useTwoUp();
  const h = (cardWidth * RENDER.height) / RENDER.width;
  return (
    <TwoUp
      phone={
        <Phone
          src={TAKE.edit}
          cuts={[
            {from: 0, at: 10.6},
            {from: 72, at: 14.0, speed: 9},
            {from: 114, at: 41.4},
            {from: 165, at: 59.9},
            {from: 198, at: 64.6},
            {from: 228, at: 80.4},
          ]}
          taps={[
            {...SPOT.emptyRoom, at: 36},
            {...SPOT.emptyButton, at: 66},
            {...SPOT.walls, at: 172},
            {...SPOT.bradford, at: 184},
            {...SPOT.emptyButton, at: 219},
          ]}
        />
      }
      card={
        <Card width={cardWidth} height={h} at={4}>
          <Swap
            items={[
              {at: 0, node: still(STILL.evening)},
              {at: 134, node: still(STILL.empty)},
              {at: 248, node: still(STILL.beige)},
            ]}
          />
          <Sequence from={134} durationInFrames={114} layout="none">
            <Pill style={{left: 22, bottom: 22}}>Empty room</Pill>
          </Sequence>
          <Sequence from={248} layout="none">
            <Pill style={{left: 22, bottom: 22}}>Bradford Beige · Nippon Paint</Pill>
          </Sequence>
        </Card>
      }
    >
      <Caption eyebrow="Edit" title="Empty the room" accent="in one tap." start={8} exit={160} />
      <Caption title="Then try" accent="a real paint." start={172} />
      <Sequence from={72} durationInFrames={42} layout="none">
        <AbsoluteFill>
          <Speed label="9× speed" />
        </AbsoluteFill>
      </Sequence>
    </TwoUp>
  );
};
