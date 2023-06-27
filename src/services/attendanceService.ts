import { format, isSameDay } from "date-fns";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { Attendance } from "../types/Attendance";
import { db } from "./firebase";
import { serverTimestamp } from "./userServices";

export const listenOnTodaysAttendance = async (
  userId: string,
  callback: (marked: boolean) => void,
) => {
  const today = await serverTimestamp({});
  const todayString = format(today.data.timestamp, "y-MM-dd");
  const attendanceRef = doc(db, `users/${userId}/attendance/${todayString}`);
  return onSnapshot(attendanceRef, (snap) => {
    if (snap.exists()) {
      callback(true);
      return;
    }
    callback(false);
  });
};

export const markAttendance = async (userId: string) => {
  const today = await serverTimestamp({});
  if (!isSameDay(today.data.timestamp, new Date())) {
    throw new Error(
      "System time is incorrect please adjust the time setting of your device",
    );
  }
  const todayString = format(new Date(), "y-MM-dd");

  const attendanceRef = doc(db, `users/${userId}/attendance/${todayString}`);
  const attendance: Attendance = {
    userId,
    timestamp: new Date().getTime(),
    dateString: todayString,
  };
  await setDoc(attendanceRef, attendance);
};
