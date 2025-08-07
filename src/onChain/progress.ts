import cliProgress from "cli-progress";
import colors from "ansi-colors";
import { CHUNK_SIZE } from "./constants";

export const indexProgress = new cliProgress.SingleBar(
  {
    format:
      "Indexing blocks |" +
      colors.blue("{bar}") +
      "| {percentage}% || {value}/{total} Chunks" +
      `(Chunk size: ${CHUNK_SIZE})`,
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
    stream: process.stdout,
  },
  cliProgress.Presets.shades_classic
);
