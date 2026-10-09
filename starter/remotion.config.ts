import {Config} from '@remotion/cli/config';

Config.setEntryPoint('src/index.ts');
// three.js needs a GPU-backed WebGL in headless Chrome. The default renderer can't run it on most
// machines and the canvas renders blank.
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
