import cliProgress from "cli-progress";
import colors from "ansi-colors";

const progress = new cliProgress.SingleBar(
  {
    format:
      colors.blue("Getting data |") +
      colors.blue("{bar}") +
      colors.blue("| {percentage}% ") +
      colors.blue("({value}/{total})"),
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
    stream: process.stdout,
  },
  cliProgress.Presets.shades_classic
);

export default progress;
