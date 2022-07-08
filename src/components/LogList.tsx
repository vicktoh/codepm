import {
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
import React, { FC, useState } from "react";
import { BsPlus } from "react-icons/bs";
import { useAppSelector } from "../reducers/types";
import { removeLog, removeLogActivity } from "../services/logsServices";
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
  const {
    isOpen: isLogModalOpen,
    onClose: onCloseLogModal,
    onOpen: onOpenLogModal,
  } = useDisclosure();

  const onAddLog = () => {
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

  if (!logList) {
    return <LoadingComponent title="Fetching Logs..." />;
  }
  return (
    <Flex direction="column" flex="1 1">
      <HStack spacing={4}>
        <Heading fontSize="md">Logs</Heading>
        <IconButton
          borderRadius="full"
          variant="outline"
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
