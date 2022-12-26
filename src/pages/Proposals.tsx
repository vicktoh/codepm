import React, { FC, useEffect, useMemo, useState } from "react";
import {
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import { AiOutlineEdit, AiOutlineEye, AiOutlinePlus } from "react-icons/ai";
import { ProposalStatus, ProposalType, STATUSES } from "../types/ProposalType";
import { deleteProposal, listenOnProposals } from "../services/projectServices";
import { BsTrash } from "react-icons/bs";
import { ProposalForm } from "../components/ProposalForm";
import {
  useGlassEffect,
  useLoadingAnimation,
} from "../hooks/useLoadingAnimation";
import { ProposalEditor } from "../components/ProposalEditor";

type ProposalRowType = {
  proposal: ProposalType;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
};
const ProposalRow: FC<ProposalRowType> = ({
  proposal,
  onEdit,
  onDelete,
  onView,
}) => {
  const { title, dateAdded, funder, status } = proposal;
  return (
    <Tr borderRadius="md">
      <Td borderLeftRadius="lg" bg="white" mb={2}>
        {title}
      </Td>
      <Td bg="white" mb={2}>
        {funder}
      </Td>
      <Td bg="white" mb={2}>
        {(dateAdded as Date).toDateString()}
      </Td>
      <Td bg="white" mb={2}>
        {status}
      </Td>
      <Td borderRightRadius="md" bg="white" mb={2}>
        <HStack alignItems="center" spacing={2}>
          <Tooltip label="edit Proposal Doc" bg="tetiary.200" placement="top">
            <IconButton
              aria-label="edit proposal"
              color="blue.400"
              icon={<Icon as={AiOutlineEdit} />}
              onClick={onEdit}
            />
          </Tooltip>
          <Tooltip label="View Proposal Doc" bg="tetiary.200" placement="top">
            <IconButton
              aria-label="view proposal doc"
              color="purple.400"
              icon={<Icon as={AiOutlineEye} />}
              onClick={onView}
            />
          </Tooltip>
          <Tooltip label="Delete proposal" bg="tetiary.200" placement="top">
            <IconButton
              aria-label="delete proposal doc"
              color="red.300"
              icon={<Icon as={BsTrash} />}
              onClick={onDelete}
            />
          </Tooltip>
        </HStack>
      </Td>
    </Tr>
  );
};

export const Proposals: FC = () => {
  const [loadingProposals, setLoadingProposals] = useState<boolean>(true);
  const [isDeletingProposals, setDeletingProposals] = useState<boolean>();
  const [proposals, setProposals] = useState<ProposalType[]>();
  const [selectedProposal, setSelectedProposal] = useState<ProposalType>();
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [filter, setFilter] = useState<keyof ProposalStatus | "all">("all");
  const loadingAnimation = useLoadingAnimation();
  const filterButtonSize = useBreakpointValue({
    base: "xs",
    md: "sm",
    lg: "sm",
  });
  const addButonSize = useBreakpointValue({ base: "md", md: "md", lg: "lg" });
  const glassEffect = useGlassEffect(true);
  const proposalsTorender = useMemo(
    () =>
      proposals?.length
        ? proposals.filter((proposals) => {
            if (filter === "all") return true;
            return proposals.status === filter;
          })
        : [],
    [filter, proposals],
  );
  const {
    isOpen: isProposalModalOpen,
    onClose: onCloseProposalModal,
    onOpen: onOpenProposalModal,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onClose: onCloseDeleteModal,
    onOpen: onOpenDeleteModal,
  } = useDisclosure();
  const {
    isOpen: isViewModalOpen,
    onClose: onCloseViewModal,
    onOpen: onOpenViewModal,
  } = useDisclosure();

  useEffect(() => {
    const unsub = listenOnProposals((data) => {
      setLoadingProposals(false);
      setProposals(data);
    });

    return () => unsub();
  }, []);

  const addProposalPrompt = () => {
    setMode("add");
    setSelectedProposal(undefined);
    onOpenProposalModal();
  };

  const editProposalPrompt = (proposal: ProposalType) => {
    setMode("edit");
    setSelectedProposal(proposal);
    onOpenProposalModal();
  };

  const viewProposalPrompt = (proposal: ProposalType) => {
    setSelectedProposal(proposal);
    onOpenViewModal();
  };

  const deletePrompt = (proposal: ProposalType) => {
    setMode("edit");
    setSelectedProposal(proposal);
    onOpenDeleteModal();
  };

  const onDelete = async () => {
    if (!selectedProposal) return;
    setDeletingProposals(true);
    await deleteProposal(selectedProposal);
    setDeletingProposals(false);
    onCloseDeleteModal();
  };
  return (
    <Flex direction="column" py={5}>
      <HStack alignItems="center" spacing="2">
        <Heading fontSize="md">Proposals</Heading>
        <IconButton
          borderRadius="full"
          colorScheme="brand"
          size={addButonSize}
          aria-label="add Proposal"
          icon={<Icon as={AiOutlinePlus} />}
          onClick={addProposalPrompt}
        />
      </HStack>

      <Flex direction="column" maxWidth="100%">
        <Flex direction="column" alignItems="end" mt={5}>
          <Heading fontSize="sm" mt={2} mb={3}>
            Filter Proposals
          </Heading>
          <HStack alignItems="center" spacing={[1, 2]}>
            <Button
              size={filterButtonSize}
              variant="ghost"
              onClick={() => setFilter("all")}
              {...(filter === "all" ? glassEffect : {})}
            >
              {" "}
              All
            </Button>
            {STATUSES.map((status, i) => (
              <Button
                size={filterButtonSize}
                {...(filter === status ? glassEffect : {})}
                variant="ghost"
                key={`key-filter-${i}`}
                onClick={() => setFilter(status as keyof ProposalStatus)}
              >
                {status}
              </Button>
            ))}
          </HStack>
        </Flex>

        <TableContainer mt={5} maxWidth="100%" whiteSpace="normal">
          <Table
            size="sm"
            sx={{
              borderCollapse: "separate",
              borderSpacing: "0 5px",
            }}
          >
            <TableCaption>All proposals pending and approved</TableCaption>
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Funder</Th>
                <Th>Date Added</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loadingProposals ? (
                <Tr bg="white" borderRadius="xl" animation={loadingAnimation}>
                  <Td
                    colSpan={5}
                    bg="white"
                    borderRadius="xl"
                    textAlign="center"
                  >
                    <Text>Please wait....</Text>
                  </Td>
                </Tr>
              ) : proposals?.length ? (
                proposalsTorender.length ? (
                  proposalsTorender.map((proposal, i) => (
                    <ProposalRow
                      onEdit={() => editProposalPrompt(proposal)}
                      proposal={proposal}
                      key={`proposal-${i}`}
                      onView={() => viewProposalPrompt(proposal)}
                      onDelete={() => deletePrompt(proposal)}
                    />
                  ))
                ) : (
                  <Tr bg="white" borderRadius="xl">
                    <Td
                      colSpan={5}
                      bg="white"
                      borderRadius="xl"
                      textAlign="center"
                    >
                      <Text>No Proposal found</Text>
                    </Td>
                  </Tr>
                )
              ) : (
                <Tr bg="white" borderRadius="xl">
                  <Td
                    colSpan={5}
                    bg="white"
                    borderRadius="xl"
                    textAlign="center"
                  >
                    <Text>No Proposals Yet</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
      <Modal
        isOpen={isProposalModalOpen}
        onClose={onCloseProposalModal}
        size="2xl"
      >
        <ModalOverlay />
        <ModalContent {...glassEffect}>
          <ModalHeader>{`${mode} proposal`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ProposalForm
              onClose={onCloseProposalModal}
              mode={mode}
              proposal={selectedProposal}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={onCloseDeleteModal} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader py={8}>{`Delete Proposal ${
            selectedProposal?.title || ""
          }`}</ModalHeader>
          <ModalCloseButton size="sm" />
          <ModalBody>
            <Text>{`Are you sure you want to delete this proposal named ${
              selectedProposal?.title || "unknown name"
            }`}</Text>
          </ModalBody>
          <ModalFooter>
            <Flex width="100%" direction="row" justifyContent="space-between">
              <Button
                disabled={isDeletingProposals}
                variant="outline"
                colorScheme="brand"
              >
                No
              </Button>
              <Button
                onClick={onDelete}
                isLoading={isDeletingProposals}
                variant="solid"
                colorScheme="brand"
              >
                Yes
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isViewModalOpen} onClose={onCloseViewModal} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            {selectedProposal ? (
              <ProposalEditor proposal={selectedProposal} />
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
