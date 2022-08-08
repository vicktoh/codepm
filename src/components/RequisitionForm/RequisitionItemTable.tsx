import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React, { FC } from "react";
import { Requisition } from "../../types/Requisition";
type RequisitionItemTableProps = {
  items: Requisition["items"];
};
export const RequisitionItemTable: FC<RequisitionItemTableProps> = ({
  items,
}) => {
  return (
    <TableContainer>
      <Table>
        <Thead>
          <Tr>
            <Th>Item Description</Th>
            <Th>Amount</Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.length ? (
            items.map((item, i) => (
              <Tr key={`requisition-item-${i}`}>
                <Td>{item.title}</Td>
                <Td>{item.amount.toLocaleString()}</Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={2} textAlign="center">
                No Items were added to this requisition
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
