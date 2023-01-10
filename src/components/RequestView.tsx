import {
  Avatar,
  Flex,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { FC, useEffect, useState } from "react";
import { useAppSelector } from "../reducers/types";
import { listenUserRequests } from "../services/logsServices";
import { Request } from "../types/Permission";

const RequestView: FC = () => {
  const { auth, users } = useAppSelector(({ auth, users }) => ({
    auth,
    users,
  }));
  const [requests, setRequests] = useState<Request[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const { usersMap = {} } = users || {};

  useEffect(() => {
    const fetchMyRequests = async () => {
      if (!auth?.uid) return;
      setLoading(true);
      const unsub = listenUserRequests(auth?.uid, (requests) => {
        setLoading(false);
        setRequests(requests);
      });
      return unsub;
    };
    fetchMyRequests();
  }, [auth?.uid]);
  return (
    <Flex direction="column" width="100%" py={8} px={2}>
      <Heading fontSize="md" mb={5}>
        My Requests
      </Heading>

      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>Day of Request</Th>
              <Th>Type of Request</Th>
              <Th>Status of Request</Th>
              <Th>Leave Type</Th>
              <Th>Dept. Head</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={5}>Fetching Requests</Td>
              </Tr>
            ) : requests?.length ? (
              requests.map((req) => (
                <Tr key={req.timestamp}>
                  <Td>{format(new Date(req.timestamp), "do MMM yyyy")}</Td>
                  <Td>{req.type}</Td>
                  <Td>{req.status}</Td>
                  <Td>{req.leaveType || "-"}</Td>
                  <Td>
                    {req.attentionToId ? (
                      <Flex direction="column" alignItems="center">
                        <Avatar
                          size="sm"
                          src={usersMap[req.attentionToId]?.photoUrl}
                          name={usersMap[req.attentionToId]?.displayName}
                        />
                        {usersMap[req.attentionToId]?.displayName}
                      </Flex>
                    ) : null}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center">
                  You have not made any request yet
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  );
};

export default RequestView;
