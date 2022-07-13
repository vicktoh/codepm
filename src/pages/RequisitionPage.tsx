import {
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { EmptyState } from "../components/EmptyState";
import { LoadingComponent } from "../components/LoadingComponent";
import { RequisitionComponent } from "../components/RequisitionComponent";
import { RequisitionFilterForm } from "../components/RequisitionFilterForm";
import { RequisitionForm } from "../components/RequisitionForm";
import RequisitionStatsComponent from "../components/RequisitionStatsComponent";
import { setRequisition } from "../reducers/requisitionsSlice";
import { useAppSelector } from "../reducers/types";
import { listenOnRequisition } from "../services/requisitionServices";
import { RequisitionStats } from "../types/Requisition";

export const RequisitionPage: FC = () => {
  const { auth, requisitions } = useAppSelector(({ auth, requisitions }) => ({
    requisitions,
    auth,
  }));
  const dispatch = useDispatch();
  const toast = useToast();
  const [loading, setLoading] = useState<boolean>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    if (!requisitions && auth) {
      setLoading(true);
      listenOnRequisition(
        auth.uid,
        (reqs) => {
          setLoading(false);
          dispatch(setRequisition(reqs));
        },
        (message) => {
          console.log(message);
          setLoading(false);
          toast({
            title: "Could not fetch requisitions",
            description: message,
            status: "error",
          });
        },
      );
    }
  }, [auth, requisitions, dispatch, toast]);

  if (!requisitions && loading) {
    return <LoadingComponent title="loading requisitions..." />;
  }

  const addNewRequisition = () => {
    onOpen();
  };
  return (
    <Flex direction="column">
      <Heading fontSize="lg" my={5}>
        My requisitions
      </Heading>
      <SimpleGrid columns={[1, 2]}>
        <RequisitionFilterForm />
        <RequisitionStatsComponent />
      </SimpleGrid>
      <Button
        onClick={addNewRequisition}
        alignSelf="flex-start"
        mt={5}
        colorScheme="brand"
      >
        New Requisiton
      </Button>
      {requisitions?.length ? (
        <>
          {requisitions.map((requisition, i) => (
            <RequisitionComponent
              key={`requisition-${i}`}
              requisition={requisition}
            />
          ))}
        </>
      ) : (
        <EmptyState title="You dont have any requisitions yet" />
      )}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>
            <Heading fontSize="2xl">Requisition🤑</Heading>
          </ModalHeader>
          <ModalBody>
            <RequisitionForm />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
