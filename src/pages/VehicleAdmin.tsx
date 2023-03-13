import {
  Avatar,
  Flex,
  Heading,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { request } from "http";
import React, { useEffect, useState } from "react";
import { AiFillEye } from "react-icons/ai";
import { BiChat } from "react-icons/bi";
import { BsCalendar, BsCalendar2 } from "react-icons/bs";
import { VehicleRequestsView } from "../components/VehicleRequestsView";
import { VehicleSchedule } from "../components/VehicleSchedule";
import { useAppSelector } from "../reducers/types";
import { listenOnVehicleAdmin } from "../services/vehicleServices";
import { VehicleRequest } from "../types/VehicleRequest";
import { REQ_STATUS_ICONS } from "./VehicleRequests";

export const VehicleAdmin = () => {
  const [requests, setRequests] = useState<VehicleRequest[]>();
  const { users } = useAppSelector(({ users }) => ({ users }));
  const { usersMap = {} } = users || {};
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedReq, setSelectedReq] = useState<VehicleRequest>();
  useEffect(() => {
    setLoading(true);
    const unsub = listenOnVehicleAdmin((reqs) => {
      setLoading(false);
      setRequests(reqs);
    });
    return unsub;
  }, []);
  const {
    onOpen: onOpenVehicleSchedule,
    onClose: onCloseVehicleSchedule,
    isOpen: isVehicleScheduleOpen,
  } = useDisclosure();
  const {
    onOpen: onOnpenViewRequest,
    onClose: onCloseViewRequest,
    isOpen: isViewRequestOpen,
  } = useDisclosure();
  const {
    onOpen: onOnpenRequestChat,
    onClose: onCloseRequestChat,
    isOpen: isRequestChatOpen,
  } = useDisclosure();

  const openViewRequest = (req: VehicleRequest) => {
    setSelectedReq(req);
    onOnpenViewRequest();
  };

  const openChatView = (req: VehicleRequest) => {
    setSelectedReq(req);
    onOnpenRequestChat();
  };

  return (
    <Flex direction="column">
      <HStack spacing={2} alignItems="center">
        <Heading fontSize="sm">Vehicle Admin page</Heading>
        <Tooltip label="View Vehicle schedule">
          <IconButton
            colorScheme="brand"
            borderRadius="full"
            icon={<BsCalendar2 />}
            aria-label="view vehicle schedule"
            onClick={onOpenVehicleSchedule}
          />
        </Tooltip>
      </HStack>

      {loading ? (
        <Flex
          alignItems="center"
          justifyContent="center"
          direction="column"
          height="152px"
        >
          <Spinner />
          <Text>Loading....</Text>
        </Flex>
      ) : (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Requester</Th>
                <Th>Duration</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {requests?.length ? (
                requests.map((req) => (
                  <Tr key={`vehicle-request-${req.id}`}>
                    <Td>
                      <HStack alignItems="center">
                        <Avatar
                          size="sm"
                          src={usersMap[req.userId]?.photoUrl || ""}
                          name={
                            usersMap[req.userId]?.displayName || "Unknown User"
                          }
                        />
                        <VStack alignItems="flex-start">
                          <Heading fontSize="sm">
                            {usersMap[req.userId]?.displayName ||
                              "Unknown User"}
                          </Heading>
                          <Text>{format(req.timestamp, "do MMM Y")}</Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>{`${format(req.startTime, "KK:mm aaa")} - ${format(
                      req.endTime,
                      "KK:mm aaa",
                    )}`}</Td>
                    <Td>
                      <HStack alignItems="center" spacing={2}>
                        <Text>{req.status}</Text>
                        {REQ_STATUS_ICONS[req.status]}
                      </HStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <>
                          <Tooltip label="View Request">
                            <IconButton
                              icon={<AiFillEye />}
                              colorScheme="blue"
                              aria-label="edit Button"
                              size="sm"
                              bg="blue.300"
                              color="white"
                              onClick={() => openViewRequest(req)}
                            />
                          </Tooltip>
                          <Tooltip label="View conversations">
                            <IconButton
                              aria-label="delete Button"
                              icon={<BiChat />}
                              size="sm"
                              bg="brand.300"
                              color="white"
                              onClick={() => openChatView(req)}
                            />
                          </Tooltip>
                        </>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={5}>
                    <Flex width="100%" direction="column" alignItems="center">
                      <Heading>Empty Requests 📝</Heading>
                      <Text>
                        You do not have any request, click the + button to make
                        a vehicle request
                      </Text>
                    </Flex>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      )}
      <Modal
        size="2xl"
        isOpen={isVehicleScheduleOpen}
        onClose={onCloseVehicleSchedule}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader textAlign="center">Vehicle Schedule 📆</ModalHeader>
          <ModalBody>
            <VehicleSchedule />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isViewRequestOpen} onClose={onCloseViewRequest}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader textAlign="center">Vehicle Request 🚘</ModalHeader>
          <ModalBody>
            {selectedReq && (
              <VehicleRequestsView
                request={selectedReq}
                onClose={onCloseViewRequest}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
