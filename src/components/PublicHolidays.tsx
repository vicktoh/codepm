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
import React, { FC, useState } from "react";
import { BsInfo, BsPencil, BsSave } from "react-icons/bs";
import { useAppSelector } from "../reducers/types";
import { updateSystemPublicHoliday } from "../services/authServices";
import { System } from "../types/System";
import { EmptyState } from "./EmptyState";

type PublicHolidayRowProps = {
  holiday: System["publicHolidays"][number];
  index: number;
};
const PublicHolidayRow: FC<PublicHolidayRowProps> = ({ holiday, index }) => {
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
          <IconButton
            onClick={() => setMode("edit")}
            aria-label="edit"
            icon={<Icon as={BsPencil} />}
          />
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
  const toast = useToast();
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
      setLoading(false);
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
            {system?.publicHolidays?.length ? (
              system.publicHolidays.map((holiday, i) => (
                <PublicHolidayRow
                  key={`holiday-${i}`}
                  holiday={holiday}
                  index={i}
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
    </Flex>
  );
};
