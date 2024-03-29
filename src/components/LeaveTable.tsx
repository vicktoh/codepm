import {
  Flex,
  Table,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { FirebaseError } from "firebase/app";
import React, { FC, useEffect, useState } from "react";
import { getPermissions } from "../services/permissionServices";
import { Permission } from "../types/Permission";
import { LoadingComponent } from "./LoadingComponent";
import * as _ from "lodash";
import { format } from "date-fns";
type LeaveTableProps = {
  userId: string;
  permission?: Permission | null;
  loading: boolean;
};
export const LeaveTable: FC<LeaveTableProps> = ({
  userId,
  permission,
  loading,
}) => {
  const leaveCategory = _.groupBy(permission?.leaveDays, "type");

  if (loading) {
    return <LoadingComponent title="Fetching leave days" />;
  }

  return (
    <Flex
      direction="column"
      height="100%"
      flex="1 1"
      bg="white"
      py={2}
      px={3}
      overflowY="auto"
      overflowX="hidden"
      borderRadius="lg"
    >
      <Table mt={8}>
        <Thead>
          <Tr>
            <Th>Leave type</Th>
            <Th>Number of days taken</Th>
            <Th>Days</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.keys(leaveCategory).length ? (
            Object.keys(leaveCategory).map((leavetype, i) => (
              <Tr key={`leave-category-${i}`}>
                <Td>{leavetype}</Td>
                <Td>{leaveCategory[leavetype].length}</Td>
                <Td>
                  {leaveCategory[leavetype].map((day, j) => (
                    <Tag key={`tag-${i}-${j}`} my="2px">
                      {format(new Date(day.date), "dd MMM Y")}
                    </Tag>
                  ))}
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={3}>This staff has not taken any leave yet</Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Flex>
  );
};
