import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Flex,
  Heading,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAppSelector } from "../reducers/types";
import {
  listenOnTodaysAttendance,
  markAttendance,
} from "../services/attendanceService";

export const Attendance = () => {
  const auth = useAppSelector(({ auth }) => auth);
  const [isAttendanceMarked, setIsAttendanceMarked] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();

  useEffect(() => {
    if (!auth?.uid) return;
    listenOnTodaysAttendance(auth?.uid, setIsAttendanceMarked);
  }, [auth?.uid]);

  const markTodaysAttendance = async () => {
    if (!auth?.uid) return;
    try {
      setLoading(true);
      await markAttendance(auth?.uid);
      toast({
        title: "Attendance registered successfully",
        status: "success",
      });
    } catch (error) {
      const err: any = error;
      toast({
        title: "Could not mark attendance",
        description: err?.message || "Unknown error",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isAttendanceMarked === false) {
    return (
      <Alert
        status="info"
        variant="subtle"
        width="max-content"
        alignItems="center"
        borderRadius="lg"
        mx="auto"
      >
        <AlertIcon />
        <AlertTitle fontSize="lg">Attendance Notice</AlertTitle>
        <AlertDescription maxWidth="lg">
          👋🏽 Hi there we noticed you have not marked your attendance for today.
          Please click the button below to register you attendnace
        </AlertDescription>
        <Button
          colorScheme="brand"
          size="sm"
          mt={5}
          isLoading={loading}
          onClick={markTodaysAttendance}
        >
          Mark attendance
        </Button>
      </Alert>
    );
  }

  return null;
};
