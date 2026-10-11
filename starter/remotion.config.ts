import {Config} from '@remotion/cli/config';

// Frames go through JPEG on their way to the video. The default quality (80) smears small UI text.
Config.setJpegQuality(95);
