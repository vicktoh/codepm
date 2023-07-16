import {
  Flex,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React from "react";
import { useParams } from "react-router-dom";
import { LoadingComponent } from "../components/LoadingComponent";
import { useSearchIndex } from "../hooks/useSearchIndex";
import { useAppSelector } from "../reducers/types";
import { Attendance } from "../types/Attendance";
export const UserAttendancePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const users = useAppSelector(({ users }) => users);
  const usersMap = users?.usersMap || {};
  const { data, loading, setFilters } = useSearchIndex<Attendance>(
    "attendance",
    `userId:"${userId}"`,
  );
  console.log(data);
  return (
    <Flex direction="column" px={5}>
      <Heading size="sm" my={5}>
        {`${usersMap[userId || ""]?.displayName}'s Attendance`}
      </Heading>
      {loading ? (
        <LoadingComponent title="fetching Attendance" />
      ) : (
        <Flex direction="column">
          <Table>
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Check in Time</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.map(({ dateString, timestamp }, i) => (
                <Tr key={`attendance-${i}`}>
                  <Td>{format(timestamp, "do MMM yyyy")}</Td>
                  <Td>{format(timestamp, "HH:mm")}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Flex>
      )}
    </Flex>
  );
};
