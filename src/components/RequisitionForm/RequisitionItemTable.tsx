import {
  Flex,
  Heading,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import { useFormikContext } from "formik";
import React, { FC, useEffect, useState } from "react";
import { fetchBudgetItems } from "../../services/requisitionServices";
import { BudgetItem } from "../../types/Project";
import { Requisition } from "../../types/Requisition";
type RequisitionItemTableProps = {
  items: Requisition["items"];
  projectId: string;
};
export const RequisitionItemTable: FC<RequisitionItemTableProps> = ({
  items,
  projectId,
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });
  const [fetching, setFetching] = useState(false);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>();
  const { setFieldValue } = useFormikContext<{ bugetIds: string[] }>();
  const toast = useToast();
  const findBudgetItem = (description: string) => {
    if (!budgetItems) return null;
    const result = budgetItems.find(
      (budget) => budget.code === description.split("-")[0].trim(),
    );
    return result;
  };
  const findDifference = (description: string) => {
    if (!budgetItems) return null;
    const result = budgetItems.find(
      (budget) => budget.code === description.split("-")[0].trim(),
    );
    if (!result) return null;
    const available = result.amount - (result.spent || 0);
    return available;
  };
  useEffect(() => {
    const getBudgets = async () => {
      try {
        setFetching(true);
        const budgets = await fetchBudgetItems(items, projectId);
        console.log(budgets);
        setBudgetItems(budgets);
        setFieldValue(
          "budgetIds",
          budgets.map(({ id }) => id),
        );
      } catch (error) {
        const err: any = error;
        console.log(err);
        toast({
          title: "could not fetch budget for line items",
          status: "error",
        });
      } finally {
        setFetching(false);
      }
    };
    getBudgets();
  }, [toast, items, projectId, setFieldValue]);
  return (
    <Flex direction="column">
      <Heading fontSize="md" my={3}>
        Item List
      </Heading>
      <TableContainer whiteSpace={isMobile ? "nowrap" : "initial"}>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Item Description</Th>
              <Th>Budget Line</Th>
              <Th>Amount</Th>
              <Th>Available Budget</Th>
              <Th>Total Budget</Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.length ? (
              items.map((item, i) => (
                <Tr key={`requisition-item-${i}`}>
                  <Td>{item.title}</Td>
                  <Td>{item.budget || ""}</Td>
                  <Td>
                    {item.amount.toLocaleString("en-NG", {
                      currency: "NGN",
                      style: "currency",
                    })}
                  </Td>
                  <Td>
                    {findDifference(item.budget || "")?.toLocaleString(
                      "en-NG",
                      { currency: "NGN", style: "currency" },
                    ) || "N/A"}
                  </Td>
                  <Td>
                    {findBudgetItem(
                      item.budget || "",
                    )?.amount.toLocaleString() || "N/A"}
                  </Td>
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
          {fetching ? <TableCaption>Fetching budget</TableCaption> : null}
        </Table>
      </TableContainer>
    </Flex>
  );
};
