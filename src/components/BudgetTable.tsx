import {
  Button,
  HStack,
  Icon,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
} from "@chakra-ui/react";
import React, { ChangeEvent, FC, useState } from "react";
import { BsPen, BsSave, BsTrash } from "react-icons/bs";
import { useParams } from "react-router-dom";
import { updateBugetItem } from "../services/budgetServices";
import { BudgetItem } from "../types/Project";
type BudgetTableProps = {
  budget: BudgetItem[];
  onDeletePrompt: (item: BudgetItem) => void;
};
type BudgetRowProps = {
  item: BudgetItem;
  onDelete: () => void;
};
const BudgetRow: FC<BudgetRowProps> = ({ item, onDelete }) => {
  const { id, spent = 0, amount, description, activity, code = "N/A" } = item;
  const { projectId } = useParams();
  const [saving, setSaving] = useState<boolean>();

  const [inputFields, setInputFields] = useState({
    amount,
    description,
    activity,
    code,
  });
  const saveBudget = async () => {
    if (!projectId) return;
    try {
      setSaving(true);
      await updateBugetItem({ id, ...inputFields }, projectId);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
      setMode("view");
    }
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputFields({ ...inputFields, [e.target.name]: e.target.value });
  };
  const [mode, setMode] = useState<"view" | "edit">("view");
  return (
    <Tr>
      <Td>
        {mode === "view" ? (
          code
        ) : (
          <Input
            variant="outline"
            borderColor="brand.300"
            size="sm"
            value={inputFields.code}
            onChange={handleChange}
            name="code"
            placeholder="code"
          />
        )}
      </Td>
      <Td>
        {mode === "view" ? (
          activity
        ) : (
          <Input
            variant="outline"
            borderColor="brand.300"
            size="sm"
            value={inputFields.activity}
            onChange={handleChange}
            name="activity"
            placeholder="activity"
          />
        )}
      </Td>
      <Td>
        {mode === "view" ? (
          description
        ) : (
          <Input
            variant="outline"
            borderColor="brand.300"
            size="sm"
            value={inputFields.description}
            onChange={handleChange}
            name="description"
            placeholder="description"
          />
        )}
      </Td>
      <Td>
        {mode === "view" ? (
          amount.toLocaleString()
        ) : (
          <Input
            variant="outline"
            borderColor="brand.300"
            type="number"
            size="sm"
            value={inputFields.amount}
            onChange={handleChange}
            name="amount"
            placeholder="amount"
          />
        )}
      </Td>
      <Td>{spent}</Td>
      <Td>
        {mode === "view" ? (
          <HStack spacing={2} alignItems="center">
            <Button
              size="xs"
              variant="outline"
              colorScheme="blue"
              leftIcon={<Icon as={BsPen} />}
              onClick={() => setMode("edit")}
            >
              Edit
            </Button>
            <Button
              size="xs"
              bg="tomato"
              onClick={onDelete}
              color="white"
              leftIcon={<Icon as={BsTrash} />}
            >
              Remove
            </Button>
          </HStack>
        ) : (
          <Button
            size="xs"
            bg="green"
            onClick={saveBudget}
            isLoading={saving}
            color="white"
            leftIcon={<Icon as={BsSave} />}
          >
            Save
          </Button>
        )}
      </Td>
    </Tr>
  );
};
export const BudgetTable: FC<BudgetTableProps> = ({
  budget,
  onDeletePrompt,
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });
  return (
    <TableContainer mt={5} whiteSpace={isMobile ? "nowrap" : "initial"}>
      <Table variant="striped" size="sm">
        <Thead>
          <Tr>
            <Th>Code</Th>
            <Th>Activity</Th>
            <Th>Description</Th>
            <Th>Amount</Th>
            <Th>Amount Spent</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {budget.map((item, i) => (
            <BudgetRow
              onDelete={() => onDeletePrompt(item)}
              key={`budget-item-${i}`}
              item={item}
            />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
