import dayjs from "dayjs";

const formatToRelativeTime = (date: string) => {
  const today = dayjs();
  const messageDate = dayjs(date);

  if (messageDate.isSame(today, "day")) {
    return messageDate.format("HH:mm"); // E.g., "15:30"
  } else if (messageDate.isSame(today.subtract(1, "day"), "day")) {
    return "Yesterday";
  } else if (messageDate.isSame(today, "year")) {
    return messageDate.format("MMM D"); // E.g., "Apr 9"
  } else {
    return messageDate.format("MMM D, YYYY"); // E.g., "Apr 9, 2025"
  }
};

export default formatToRelativeTime;
