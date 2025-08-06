import dayjs from "dayjs";

export const now = dayjs();
export const sevenDaysAgo = now.subtract(7, "day");
