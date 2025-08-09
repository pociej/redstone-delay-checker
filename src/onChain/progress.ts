import cliProgress from "cli-progress";
import colors from "ansi-colors";
import { CHUNK_SIZE } from "./constants";

export const indexProgress = new cliProgress.SingleBar(
  {
    format:
      colors.blue("Indexing blocks |") +
      colors.blue("{bar}") +
      colors.blue("| {percentage}% || {value}/{total} Chunks") +
      colors.blue(`(Chunk size: ${CHUNK_SIZE})`),
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
    stream: process.stdout,
  },
  cliProgress.Presets.shades_classic
);
