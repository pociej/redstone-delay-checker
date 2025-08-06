import dayjs from "dayjs";
import { args } from "./parseArgs";

export const now = dayjs();
export const from = now.subtract(args.start_offset, "hours");
