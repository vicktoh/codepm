import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { isSameDay } from "date-fns";
import React, { FC, useEffect, useMemo, useState } from "react";
import { BsPlus } from "react-icons/bs";
import { useAppSelector } from "../reducers/types";
import { removeLog, removeLogActivity } from "../services/logsServices";
import { serverTimestamp } from "../services/userServices";
import { Log } from "../types/Log";
import { EmptyState } from "./EmptyState";
import { LoadingComponent } from "./LoadingComponent";
import { LogComponent } from "./LogComponent";
import { LogForm } from "./LogForm";
type LogListProps = {
  logList: Log[];
};
export const LogList: FC<LogListProps> = ({ logList }) => {
  const { auth } = useAppSelector(({ logs, auth }) => ({ auth }));
  const [selectedLog, setSelectedLog] = useState<{
    logIndex: number;
    activityIndex: number;
  }>();
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [serverTime, setServerTime] = useState<number>();
  const {
    isOpen: isLogModalOpen,
    onClose: onCloseLogModal,
    onOpen: onOpenLogModal,
  } = useDisclosure();

  const isTimeCorrect = useMemo(() => {
    if (!serverTime) return true;
    return isSameDay(new Date(serverTime), new Date());
  }, [serverTime]);
  const onAddLog = async () => {
    await getServerTimestamp();
    if (serverTime && !isSameDay(new Date(), new Date(serverTime))) return;
    setSelectedLog(undefined);
    setMode("add");
    onOpenLogModal();
  };

  const onEditLog = (logIndex: number, activityIndex: number) => {
    setSelectedLog({ logIndex, activityIndex });
    setMode("edit");
    onOpenLogModal();
  };

  const onDeleteLog = async (logIndex: number, activityIndex: number) => {
    const log = logList[logIndex];
    const activity = log.activity[activityIndex];
    if (log.activity.length > 1) {
      await removeLogActivity(auth?.uid || "", log.dateString, activity);
    } else {
      await removeLog(auth?.uid || "", log.dateString);
    }
  };
  const getServerTimestamp = async () => {
    const res = await serverTimestamp({});
    setServerTime(res.data.timestamp);
  };
  useEffect(() => {
    getServerTimestamp();
  }, []);

  if (!logList) {
    return <LoadingComponent title="Fetching Logs..." />;
  }

  return (
    <Flex direction="column" flex="1 1">
      {isTimeCorrect ? null : (
        <Alert
          status="error"
          my={5}
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <AlertIcon />
          <AlertTitle>Incorrect time</AlertTitle>
          <AlertDescription>
            Your system time is incorrect. Please set your date to the correct
            date and refresh the page before you fill your logs
          </AlertDescription>
        </Alert>
      )}
      <HStack spacing={4}>
        <Heading fontSize="md">Logs</Heading>
        <IconButton
          borderRadius="full"
          variant="outline"
          disabled={!isTimeCorrect}
          onClick={onAddLog}
          icon={<Icon as={BsPlus} />}
          aria-label="Add new Log"
        />
      </HStack>
      <Flex direction="column" flex="1 1" overflowY="auto">
        {logList?.length ? (
          logList.map((log, i) => (
            <LogComponent
              logIndex={i}
              log={log}
              onDelete={onDeleteLog}
              onEdit={onEditLog}
              key={`log-${i}`}
              orientation={i % 2 === 0 ? "left" : "right"}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </Flex>
      <Modal isOpen={isLogModalOpen} onClose={onCloseLogModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>✍🏾 What did you do today?</ModalHeader>
          <ModalBody>
            <LogForm
              mode={mode}
              logIndex={selectedLog?.logIndex}
              actvityIndex={selectedLog?.activityIndex}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
