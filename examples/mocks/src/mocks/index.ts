import {aurelo} from './Aurelo';
import {brisk} from './Brisk';
import {buildLog} from './BuildLog';
import {fern} from './Fern';
import {fieldwork} from './Fieldwork';
import {halcyon} from './Halcyon';
import {inkwell} from './Inkwell';
import {juniper} from './Juniper';
import {ledgerly} from './Ledgerly';
import {margin} from './Margin';
import type {Mock} from './mock';
import {orbit} from './Orbit';
import {pantrio} from './Pantrio';
import {paylark} from './Paylark';
import {quillo} from './Quillo';
import {quilloNew} from './QuilloNew';
import {stride} from './Stride';
import {vaultly} from './Vaultly';
import {wander} from './Wander';

/** Every mock, in the order the posters sheet shows them: product launches, then other agendas. */
export const MOCKS: Mock[] = [
  quillo, brisk, ledgerly, pantrio, paylark, aurelo, inkwell, fern, wander,
  fieldwork, orbit, quilloNew, stride, halcyon, margin, vaultly, buildLog, juniper,
];
