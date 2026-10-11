import {Config} from '@remotion/cli/config';

// Frames go through JPEG on their way to the video. The default quality (80) smears small UI text.
Config.setJpegQuality(95);
// The shader transitions (zoomBlur, filmBurn, ...) need WebGL2, which Remotion's default GL can't
// create headless: ANGLE on macOS, its software fallback elsewhere.
Config.setChromiumOpenGlRenderer(process.platform === 'darwin' ? 'angle' : 'swangle');
