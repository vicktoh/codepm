import {
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
import React, { FC } from "react";
import { Requisition } from "../../types/Requisition";
type RequisitionBeneficiaryTableProps = {
  beneficiaries: Requisition["beneficiaries"];
};
export const RequisitionBeneficiaryTable: FC<
  RequisitionBeneficiaryTableProps
> = ({ beneficiaries }) => {
  return (
    <Flex direction="column">
      <Heading fontSize="md" my={3}>
        Beneficiaries
      </Heading>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Account Number</Th>
              <Th>Bank</Th>
              <Th>Amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            {beneficiaries.length ? (
              beneficiaries.map(({ name, accountNumber, bank, amount }, i) => (
                <Tr key={`requisition-beneficiary-${i}`}>
                  <Td>{name}</Td>
                  <Td>{accountNumber}</Td>
                  <Td>{bank}</Td>
                  <Td>
                    {Number(amount).toLocaleString("en-NG", {
                      currency: "NGN",
                      style: "currency",
                    })}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={3} textAlign="center">
                  No Items were added to this requisition
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  );
};
