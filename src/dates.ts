import dayjs from "dayjs";
import { start_offset } from "./parseArgs";

export const end = dayjs();
export const start = end.subtract(start_offset, "hours");
