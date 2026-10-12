import React from 'react';
import {Bell} from 'lucide-react';
import type {Demo} from '../../types';
import {Area, useArea} from '../_demo';
import {Toast} from './toast';

const ToastDemo: React.FC = () => {
  const {w} = useArea();
  const width = Math.min(760, w * 0.95);
  return (
    <Area gap={22}>
      <Toast title="Build passed" body="All 214 checks green on main · 2m 14s" start={6} width={width} />
      <Toast title="Review requested" body="Ana wants you to look at #482" icon={Bell} time="1m ago" start={30} width={width} />
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Notification', code: '<Toast title="Build passed" body="..." />', seconds: 3, hero: 70, Component: ToastDemo},
];
