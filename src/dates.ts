import dayjs from "dayjs";
import { args } from "./parseArgs";

export const end = dayjs();
export const start = end.subtract(args.start_offset, "hours");
