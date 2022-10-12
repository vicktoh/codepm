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
  Select,
  SimpleGrid,
  Text,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useFormikContext } from "formik";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { BiMinusCircle } from "react-icons/bi";
import { BsPlus } from "react-icons/bs";
import { converNumtoWord, requisitonTotal } from "../../helpers";
import { getBudgetItems } from "../../services/budgetServices";
import { BudgetItem } from "../../types/Project";
import {
  RequisitionCurrency,
  RequisitionFormValues,
} from "../../types/Requisition";

export const ItemsForm = () => {
  const { values, setFieldValue, errors, touched, handleBlur, handleChange } =
    useFormikContext<RequisitionFormValues>();
  const total = useMemo(() => requisitonTotal(values.items), [values]);
  const [fetching, setFetching] = useState<boolean>(false);
  const [budgetList, setBudgetList] = useState<BudgetItem[]>();
  console.log({ budgetList });

  const toast = useToast();
  useEffect(() => {
    const fetchBudget = async () => {
      if (!values.projectId) return;
      try {
        setFetching(true);
        const budget = await getBudgetItems(values.projectId);
        setBudgetList(budget);
      } catch (error) {
        console.log(error);
        toast({
          title: "Didn't find a budget for this project",
          status: "warning",
        });
      } finally {
        setFetching(false);
      }
    };
    fetchBudget();
  }, [values.projectId, toast]);
  const addItem = () => {
    const items = [...(values.items || [])];
    items.push({
      title: "",
      amount: 0,
    });
    setFieldValue("items", items);
  };
  const removeItem = (i: number) => {
    const items = [...values.items];
    const ids = [...(values.budgetIds || [])];
    items.splice(i, 1);
    ids.splice(i, 1);
    setFieldValue("items", items);
    setFieldValue("budgetIds", ids);
  };
  return (
    <Flex direction="column" px={5} pb={5}>
      <VStack justifyContent="center">
        <Heading fontSize="md">Requisition Items</Heading>
        <Text>Step 2 of 3</Text>
      </VStack>
      <HStack spacing={2} mb={2}>
        <Heading fontSize="md">Item List</Heading>
        <IconButton
          variant="outline"
          onClick={addItem}
          colorScheme="brand"
          rounded="full"
          icon={<Icon as={BsPlus} />}
          aria-label="add item"
        />
      </HStack>
      <Flex direction="column" mb={5}>
        {values.items.length ? (
          values.items.map((item, i) => (
            <SimpleGrid
              key={`req-item-${i}`}
              columns={[1, 3]}
              p={2}
              gridGap={3}
              borderWidth={1}
            >
              <Input
                placeholder="Item title"
                size="sm"
                name={`items.${i}.title`}
                onChange={handleChange}
                onBlur={handleBlur}
                value={item.title}
              />
              <Input
                placeholder="Budget Line"
                size="sm"
                list="budgetlist"
                name={`items.${i}.budget`}
                onChange={handleChange}
                onBlur={handleBlur}
                value={item.budget}
              />
              <HStack spacing={2}>
                <Input
                  placeholder="Item amount"
                  type="number"
                  size="sm"
                  name={`items.${i}.amount`}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={item.amount || ""}
                />
                <IconButton
                  size="sm"
                  color="red.300"
                  aria-label="remove item"
                  icon={<Icon as={BiMinusCircle} />}
                  onClick={() => removeItem(i)}
                />
              </HStack>
            </SimpleGrid>
          ))
        ) : (
          <Input value="Click the plus button above to add items" readOnly />
        )}
      </Flex>
      <SimpleGrid columns={[1, 2]} gridGap={3} mb={5}>
        <FormControl isInvalid={!!touched.currency && !!errors.currency}>
          <FormLabel>Currency</FormLabel>
          <Select
            value={values.currency}
            name="currency"
            onChange={handleChange}
            onBlur={handleBlur}
          >
            {Object.values(RequisitionCurrency).map((curr, i) => (
              <option key={`curr-${curr}`} value={curr}>
                {curr}
              </option>
            ))}
          </Select>
          <FormErrorMessage>
            {touched.currency && errors.currency}
          </FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel>Total</FormLabel>
          <Input
            readOnly
            value={total.toLocaleString()}
            onChange={handleChange}
          />
        </FormControl>
      </SimpleGrid>
      <FormControl mb={5}>
        <FormLabel>Ammount In Words</FormLabel>
        <Textarea
          value={total ? converNumtoWord(total, values.currency) : ""}
          readOnly
        />
        <FormErrorMessage>
          {touched.currency && errors.currency}
        </FormErrorMessage>
      </FormControl>
      <Flex direction="row" justifyContent="space-between">
        <Button
          variant="outline"
          colorScheme="brand"
          onClick={() => setFieldValue("step", 1)}
        >
          Previous
        </Button>
        <Button
          disabled={!!!values.items.length}
          colorScheme="brand"
          onClick={() => setFieldValue("step", 3)}
        >
          Next
        </Button>
      </Flex>
      <datalist id="budgetlist">
        {budgetList?.length
          ? budgetList.map((budget) => (
              <option
                key={`budget-list-${budget.code}`}
                value={`${budget.code} - ${budget.description}`}
              ></option>
            ))
          : null}
      </datalist>
    </Flex>
  );
};
