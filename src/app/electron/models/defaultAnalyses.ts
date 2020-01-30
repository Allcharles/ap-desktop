import { APAnalysis } from "./analysis";
import {
  AnalysisOption,
  AnalysisOptions,
  AnalysisProcessingType,
  Enabled
} from "./analysisHelper";

export const DEFAULT_OPTIONS: AnalysisOptions = {
  [AnalysisOption.mixDownToMono]: Enabled.True,
  [AnalysisOption.parallel]: true
};

// TODO Update this to read from AP's AnalysesAvailable command
export const defaultAnalyses: APAnalysis[] = [
  new APAnalysis(
    AnalysisProcessingType.audio2csv,
    "Basic Analysis",
    {
      template: "Towsey.Acoustic.yml",
      changes: {}
    },
    "Basic visual analysis of audio.",
    "[BETA] Generates all our default summary & spectral acoustic indices. Also generates false color spectrograms IFF IndexCalculationDuration==60.0.",
    { ...DEFAULT_OPTIONS }
  ),
  new APAnalysis(
    AnalysisProcessingType.audio2csv,
    "Crow Event Detection",
    {
      template: "Towsey.Crow.yml",
      changes: {
        SaveIntermediateWavFiles: "WhenEventsDetected",
        SaveSonogramImages: "WhenEventsDetected"
      }
    },
    "Automatic detection of crow 'caw' sounds.",
    "Automatic detection of crow 'caw' sounds in audio files GREATER than 5 minutes long. This combines with the EventDetection utility under the Utilities tab.",
    { ...DEFAULT_OPTIONS }
  ),
  new APAnalysis(
    AnalysisProcessingType.audio2csv,
    "Human Event Detection",
    {
      template: "Towsey.Human.yml",
      changes: {
        SaveIntermediateWavFiles: "WhenEventsDetected",
        SaveSonogramImages: "WhenEventsDetected"
      }
    },
    "Automatic detection of human voices.",
    "Automatic detection of human (male/female) voices in audio files GREATER than 5 minutes long. This combines with the EventDetection utility under the Utilities tab.",
    { ...DEFAULT_OPTIONS }
  ),
  new APAnalysis(
    AnalysisProcessingType.audio2csv,
    "Koala Event Detection",
    {
      template: "Towsey.KoalaMale.yml",
      changes: {
        SaveIntermediateWavFiles: "WhenEventsDetected",
        SaveSonogramImages: "WhenEventsDetected"
      }
    },
    "Automatic detection of koala sounds.",
    "Automatic detection of koala sounds in audio files GREATER than 5 minutes long. This combines with the EventDetection utility under the Utilities tab.",
    { ...DEFAULT_OPTIONS }
  )
];
