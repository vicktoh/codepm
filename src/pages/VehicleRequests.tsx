import {
  Button,
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
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { ReactElement, useEffect, useState } from "react";
import { BsCheck2All, BsClock, BsPlus, BsXCircle } from "react-icons/bs";
import { VehicleRequestForm } from "../components/VehicleRequestForm";
import { useAppSelector } from "../reducers/types";
import { listenOnMyVehicleRequests } from "../services/vehicleServices";
import { VehicleRequest } from "../types/VehicleRequest";

const REQ_STATUS_ICONS: Record<VehicleRequest["status"], ReactElement> = {
  approved: <BsCheck2All color="green" />,
  declined: <BsXCircle color="red" />,
  pending: <BsClock color="orange" />,
};
export const VehicleRequests = () => {
  const [myVehicleRequest, setMyVehicleRequests] = useState<VehicleRequest[]>();
  const [selectedRequest, setSelectedRequest] = useState<VehicleRequest>();
  const [mode, setMode] = useState<"add" | "edit">("add");
  const {
    onOpen: onOpenVehModal,
    onClose: onCloseVehModal,
    isOpen: isVehModalOpen,
  } = useDisclosure();
  const { auth } = useAppSelector(({ auth }) => ({ auth }));
  const [loading, setLoading] = useState(false);

  const onMakeVehRequest = () => {
    setMode("add");
    setSelectedRequest(undefined);
    onOpenVehModal();
  };

  const onEditRequest = (request: VehicleRequest) => {
    setSelectedRequest(request);
    setMode("edit");
    onOpenVehModal();
  };
  useEffect(() => {
    setLoading(true);
    const unsub = listenOnMyVehicleRequests(auth?.uid || "", (reqs) => {
      setLoading(false);
      setMyVehicleRequests(reqs);
    });

    return unsub;
  }, [auth?.uid]);
  return (
    <Flex direction="column" flex="1 1">
      <HStack alignItems="center" spacing={4} mb={5}>
        <Heading fontSize="lg">Vehicle Request 🚗</Heading>
        <IconButton
          aria-label="make request"
          onClick={onMakeVehRequest}
          borderRadius="full"
          size="md"
          colorScheme="brand"
          icon={<BsPlus />}
        />
      </HStack>
      {loading ? (
        <Flex
          alignItems="cen"
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
                <Th>Date</Th>
                <Th>Duration</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {myVehicleRequest?.length ? (
                myVehicleRequest.map((req) => (
                  <Tr key={`vehicle-request-${req.id}`}>
                    <Td>{format(req.timestamp, "Do MMM Y")}</Td>
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
                      <Button
                        size="sm"
                        mx={2}
                        bg="blue.300"
                        color="white"
                        onClick={() => onEditRequest(req)}
                      >
                        Edit
                      </Button>
                      <Button size="sm">Print Approval</Button>
                      <Button size="sm">Delete</Button>
                      <Button size="sm">Comments</Button>
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
      <Modal isOpen={isVehModalOpen} onClose={onCloseVehModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader textAlign="center">VehicleRequest</ModalHeader>
          <ModalBody>
            <VehicleRequestForm
              request={selectedRequest}
              onClose={onCloseVehModal}
              mode={mode}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
