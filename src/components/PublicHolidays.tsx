import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Thead,
  Tooltip,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { FC, useMemo, useState } from "react";
import { BsInfo, BsPencil, BsSave, BsTrash2 } from "react-icons/bs";
import { useAppSelector } from "../reducers/types";
import {
  deleteSystemPublicHoliday,
  updateSystemPublicHoliday,
} from "../services/authServices";
import { System } from "../types/System";
import { DeleteDialog } from "./DeleteDialog";
import { EmptyState } from "./EmptyState";

type PublicHolidayRowProps = {
  holiday: System["publicHolidays"][number];
  index: number;
  onDelete: (index: number) => void;
};
const PublicHolidayRow: FC<PublicHolidayRowProps> = ({
  holiday,
  index,
  onDelete,
}) => {
  const [date, setDate] = useState<string>(holiday.date);
  const [name, setName] = useState<string>(holiday.name);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [saving, setSaving] = useState<boolean>(false);
  const { system } = useAppSelector(({ system }) => ({ system }));
  const toast = useToast();
  const onEditPublicHoliday = async () => {
    const publicHolidays = [...(system?.publicHolidays || [])];
    if (!publicHolidays[index]) return;
    publicHolidays[index] = {
      name,
      date: format(new Date(date), "y-MM-dd"),
    };
    try {
      setSaving(true);
      await updateSystemPublicHoliday({ publicHolidays });
    } catch (error) {
      const err: any = error;
      toast({
        title: "Could not edit public holiday",
        description: err?.message || "Unknown error",
        status: "error",
      });
    } finally {
      setSaving(false);
      setMode("view");
    }
  };

  return (
    <Tr>
      <Td>
        {mode === "view" ? (
          format(new Date(holiday.date), "do MMM yyyy")
        ) : (
          <Input
            value={date}
            type="date"
            onChange={(e) => setDate(e.target.value)}
          />
        )}
      </Td>
      <Td>
        {mode === "view" ? (
          holiday.name
        ) : (
          <Input
            value={name}
            type="text"
            onChange={(e) => setName(e.target.value)}
          />
        )}
      </Td>
      <Td>
        {mode === "view" ? (
          <>
            <IconButton
              onClick={() => setMode("edit")}
              aria-label="edit"
              icon={<Icon as={BsPencil} />}
            />
            <IconButton
              onClick={() => onDelete(index)}
              aria-label="delete"
              bg="brand.300"
              color="white"
              ml={3}
              icon={<Icon as={BsTrash2} />}
            />
          </>
        ) : (
          <IconButton
            aria-label="save"
            isLoading={saving}
            onClick={onEditPublicHoliday}
            icon={<Icon as={BsSave} />}
          />
        )}
      </Td>
    </Tr>
  );
};
export const PublicHolidays = () => {
  const { system } = useAppSelector(({ system }) => ({ system }));
  const [date, setDate] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [err, setErr] = useState<{ date: string; title: string }>({
    date: "",
    title: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState<boolean>(false);
  const [selectedPublichHolidayIndex, setSelectePublicHolidayIndex] =
    useState<number>();
  const toast = useToast();
  const publicHolidaysToRender = useMemo(() => {
    return (system?.publicHolidays || [])
      .map((publichHoliday, i) => ({
        ...publichHoliday,
        id: i,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;
        return 0;
      });
  }, [system?.publicHolidays]);
  const onAddPublicHoliday = async () => {
    if (!date || !title) {
      setErr({
        date: !date ? "Date is required" : "",
        title: !title ? "Public holiday title is required" : "",
      });
      return;
    }
    const payload: System["publicHolidays"][number] = {
      name: title,
      date: format(new Date(date), "y-MM-dd"),
    };
    const publicHolidays = [...(system?.publicHolidays || [])];
    publicHolidays.push(payload);
    try {
      setLoading(true);
      await updateSystemPublicHoliday({ publicHolidays });
      setTitle("");
      setDate("");
    } catch (error) {
      const err: any = error;
      toast({
        title: "Could not add public holiday",
        description: err?.message || "Unknown error",
        status: "error",
      });
    } finally {
      setSelectePublicHolidayIndex(undefined);
      setLoading(false);
      setShowDeletePrompt(false);
    }
  };
  const onDeletPropmpt = (index: number) => {
    setSelectePublicHolidayIndex(index);
    setShowDeletePrompt(true);
  };
  const onDeleteHoliday = async () => {
    if (selectedPublichHolidayIndex === undefined) return;
    try {
      setDeleting(true);
      await deleteSystemPublicHoliday(selectedPublichHolidayIndex);
    } catch (error) {
      const err: any = error;
      toast({
        title: "Could not delete Public Holiday",
        description: err?.message || "Unknown error",
        status: "error",
      });
    } finally {
      setDeleting(false);
    }
  };
  return (
    <Flex direction="column" py={5} px={2}>
      <HStack spacing={1} alignItems="center" mb={5}>
        <Heading size="lg">Public Holiday</Heading>
        <Tooltip label="Add and remove public holidays from the list below. Note this list should be continously updated with holidays from the log start date to the end of the year">
          <Icon as={BsInfo} boxSize="1.5" />
        </Tooltip>
      </HStack>

      <HStack
        spacing={2}
        alignItems="center"
        bg="white"
        padding={3}
        borderRadius="lg"
      >
        <FormControl isInvalid={!!err.date}>
          <FormLabel>Date</FormLabel>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Date of Holiday"
          />
          <FormErrorMessage>{err.date}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!err.title}>
          <FormLabel>Name</FormLabel>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name of Holiday"
          />
          <FormErrorMessage>{err.title}</FormErrorMessage>
        </FormControl>

        <Button
          size="md"
          colorScheme="brand"
          isLoading={loading}
          onClick={onAddPublicHoliday}
          alignSelf="flex-end"
          width="30%"
        >
          Add
        </Button>
      </HStack>

      <TableContainer mt={5}>
        <Table bg="white" borderRadius="lg">
          <Thead>
            <Tr>
              <Td>Date of Holiday</Td>
              <Td>Name of Holiday</Td>
              <Td>Action</Td>
            </Tr>
          </Thead>
          <Tbody>
            {publicHolidaysToRender.length ? (
              publicHolidaysToRender.map((holiday, i) => (
                <PublicHolidayRow
                  key={`holiday-${holiday.id}`}
                  holiday={holiday}
                  index={holiday.id}
                  onDelete={onDeletPropmpt}
                />
              ))
            ) : (
              <Tr>
                <Td colSpan={3}>
                  <EmptyState title="No Public Holiday Added" />
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
      {showDeletePrompt ? (
        <Modal
          isOpen={showDeletePrompt}
          onClose={() => setShowDeletePrompt(false)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <ModalCloseButton />
              Confirm Delete
            </ModalHeader>
            <ModalBody>
              <DeleteDialog
                isLoading={deleting}
                onConfirm={onDeleteHoliday}
                onClose={() => setShowDeletePrompt(false)}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      ) : null}
    </Flex>
  );
};
