import {
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { BsPencil } from "react-icons/bs";
import { PublicHolidays } from "../components/PublicHolidays";
import { SystemForm } from "../components/SystemForm";
import { SystemFields } from "../constants";
import { useAppSelector } from "../reducers/types";
import { System } from "../types/System";

export const SystemPage = () => {
  const { system } = useAppSelector(({ system }) => ({ system }));
  const [mode, setMode] = useState<"edit" | "view">("view");
  return (
    <Flex direction="column" width="100%" px={5} py={10}>
      <HStack mb={5}>
        <Heading my={3} size="lg">
          System Settings
        </Heading>
        {mode === "view" ? (
          <IconButton
            aria-label="edit"
            icon={<Icon as={BsPencil} />}
            onClick={() => setMode("edit")}
          />
        ) : null}
      </HStack>
      {mode === "view" ? (
        <TableContainer>
          <Table bg="white" borderRadius="lg">
            <Thead>
              <Tr>
                <Th>Setting</Th>
                <Th>Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              {system && Object.keys(system).length ? (
                Object.keys(system).map((key, i) =>
                  key !== "publicHolidays" ? (
                    <Tr key={`system-setting-${i}`}>
                      <Td>{SystemFields[key as keyof System]}</Td>
                      <Td>{system[key as keyof System]}</Td>
                    </Tr>
                  ) : null,
                )
              ) : (
                <Tr>No system variable yet</Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      ) : null}
      {mode === "edit" ? <SystemForm onClose={() => setMode("view")} /> : null}

      <PublicHolidays />
    </Flex>
  );
};
