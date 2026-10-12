import React from 'react';
import {useCurrentFrame} from 'remotion';
import {mix} from '../../../look';
import {useTempo} from '../_shared';

export type ChatMessage = {from: 'me' | 'them'; text: string; at: number};

const TypingDots: React.FC<{size: number; color: string}> = ({size, color}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{display: 'flex', gap: size * 0.28, padding: `${size * 0.2}px 0`}}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: size * 0.36,
            height: size * 0.36,
            borderRadius: '50%',
            background: color,
            transform: `translateY(${-size * 0.16 * Math.max(0, Math.sin(frame * 0.32 - i * 0.9))}px)`,
            opacity: 0.55 + 0.45 * Math.max(0, Math.sin(frame * 0.32 - i * 0.9)),
          }}
        />
      ))}
    </div>
  );
};

/**
 * A conversation: bubbles arriving one by one, each of theirs preceded by `typing` frames of typing
 * dots, earlier ones pushed up as new ones land. Mine in the accent on the right, theirs on cards on
 * the left. For an assistant, support, a team thread.
 *
 *   <Chat messages={[{from: 'them', text: 'Can you ship it tonight?', at: 20}, {from: 'me', text: 'Already merged.', at: 46}]} />
 */
export const Chat: React.FC<{
  /** The bubbles, in order: who sent each (`from`: 'me' or 'them'), its `text`, and the frame `at` it lands. */
  messages: ChatMessage[];
  /** Its width in px (default 640). */
  width?: number;
  /** Size of the text in px (default 28). */
  size?: number;
  /** Frames of typing dots before each of their messages (default 22). */
  typing?: number;
  /** Frame it starts to leave; it stays to the end if not set. */
  exit?: number;
}> = ({
  messages,
  width = 640,
  size = 28,
  typing = 22,
  exit,
}) => {
  const {look, frame, glide, pop, gone} = useTempo();
  const out = gone(exit);
  const r = look.radius === 0 ? 0 : Math.max(18, Math.min(30, look.radius + 8));
  return (
    <div style={{width, display: 'flex', flexDirection: 'column', opacity: 1 - out}}>
      {messages.map((m, i) => {
        const mine = m.from === 'me';
        const wait = mine ? 0 : typing;
        const appear = m.at - wait;
        // A grid row from 0fr to 1fr grows to exactly its content's height, pushing the others up.
        const grow = Math.min(1, glide(appear, 12));
        const landed = frame >= m.at;
        const p = pop(landed ? m.at : appear, 16);
        if (frame < appear) return null;
        return (
          <div key={i} style={{display: 'grid', gridTemplateRows: `${grow}fr`}}>
            <div style={{minHeight: 0, overflow: 'hidden', padding: `0 6px`}}>
              <div style={{display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', paddingTop: i === 0 ? 0 : size * 0.5, paddingBottom: 4}}>
                <div
                  style={{
                    maxWidth: '78%',
                    padding: `${size * 0.45}px ${size * 0.7}px`,
                    borderRadius: r,
                    [mine ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: r === 0 ? 0 : 6,
                    background: mine ? look.accent : look.dark ? look.surface : mix(look.background, look.ink, 0.07),
                    border: mine || !look.dark ? undefined : `1px solid ${look.line}`,
                    color: mine ? look.onAccent : look.ink,
                    fontFamily: look.fonts.body,
                    fontSize: size,
                    fontWeight: 500,
                    lineHeight: 1.3,
                    transform: `scale(${0.6 + 0.4 * p})`,
                    transformOrigin: mine ? '100% 100%' : '0% 100%',
                    opacity: Math.min(1, p * 2),
                  }}
                >
                  {landed ? m.text : <TypingDots size={size} color={look.dim} />}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
