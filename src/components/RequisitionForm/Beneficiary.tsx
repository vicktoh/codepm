import React from "react";
import {
  Avatar,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  SimpleGrid,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { getIn, useFormikContext } from "formik";
import { BiMinus } from "react-icons/bi";
import { BsPlus } from "react-icons/bs";
import { useAppSelector } from "../../reducers/types";
import {
  Beneficiary as BeneficiaryType,
  RequisitionFormValues,
} from "../../types/Requisition";
import { UserListPopover } from "../UserListPopover";
import { RequisitionAttachmentForm } from "./RequisitionAttachementForm";

export const Beneficiary = () => {
  const { values, handleBlur, setFieldValue, isSubmitting, errors, touched } =
    useFormikContext<RequisitionFormValues>();
  const { users, vendors } = useAppSelector(({ users, vendors }) => ({
    users,
    vendors,
  }));
  const { usersMap = {} } = users || {};
  const addItem = () => {
    setFieldValue("beneficiaries", [
      ...values.beneficiaries,
      { name: "", bank: "", accountNumber: "" },
    ]);
  };
  const onSelectAttentionTo = (userId: string) => {
    if (!values.attentionTo) {
      setFieldValue("attentionTo", [userId]);
      return;
    }
    const index = values.attentionTo.indexOf(userId);
    const attentionTo = [...values.attentionTo];
    if (index > -1) {
      attentionTo.splice(index, 1);
      setFieldValue("attentionTo", attentionTo);
    } else {
      attentionTo.push(userId);
      setFieldValue("attentionTo", attentionTo);
    }
  };
  const onInputChange = (
    index: number,
    newText: string,
    name: keyof BeneficiaryType,
  ) => {
    const v = [...values.beneficiaries];
    const parts = newText.split("-");
    if (parts[0] && parts[1] && parts[2]) {
      v[index]["accountNumber"] = newText.split("-")[1].trim() || "N/A";
      v[index]["bank"] = newText.split("-")[2].trim() || "N/A";
      v[index]["name"] = newText.split("-")[0].trim() || "N/A";
      setFieldValue("beneficiaries", v);
    } else {
      v[index][name] = newText;
      setFieldValue("beneficiaries", v);
    }
  };
  const removeItem = (index: number) => {
    const beneficiaries = [...values.beneficiaries];
    beneficiaries.splice(index, 1);
    setFieldValue("beneficiaries", beneficiaries);
  };
  return (
    <Flex direction="column" px={5} pb={5}>
      <VStack alignItems="center" mb={5}>
        <Heading fontSize="lg">Beneficiarys</Heading>
        <Text>Step 3 of 3</Text>
      </VStack>
      <HStack spacing={3}>
        <Heading fontSize="md">Beneficiaries</Heading>
        <IconButton
          variant="outline"
          onClick={addItem}
          colorScheme="brand"
          rounded="full"
          icon={<Icon as={BsPlus} />}
          aria-label="add item"
        />
      </HStack>
      <Flex my={5} direction="column">
        {values.beneficiaries.length ? (
          values.beneficiaries.map(({ name, accountNumber, bank }, i) => (
            <SimpleGrid
              gridGap={3}
              key={`beneficiary-input-${i}`}
              columns={[1, 3]}
              alignItems="center"
            >
              <Input
                size="sm"
                value={name}
                name={`beneficiaries.${i}.name`}
                placeholder="Account Name"
                list="vendorlist"
                onChange={(e) => onInputChange(i, e.target.value, "name")}
                onBlur={handleBlur}
              />
              <Tooltip
                colorScheme="danger"
                label={getIn(errors, `beneficiaries.${i}.accountNumber`)}
              >
                <Input
                  isInvalid={
                    !!getIn(errors, `beneficiaries.${i}.accountNumber`)
                  }
                  size="sm"
                  value={accountNumber}
                  name={`beneficiaries.${i}.accountNumber`}
                  placeholder="Account Number"
                  list="vendorlist"
                  onChange={(e) =>
                    onInputChange(i, e.target.value, "accountNumber")
                  }
                  onBlur={handleBlur}
                />
              </Tooltip>
              <HStack spacing={2}>
                <Input
                  size="sm"
                  value={bank}
                  name={`beneficiaries.${i}.bank`}
                  placeholder="Bank Name"
                  list="vendorlist"
                  onChange={(e) => onInputChange(i, e.target.value, "bank")}
                  onBlur={handleBlur}
                />
                <IconButton
                  onClick={() => removeItem(i)}
                  aria-label="remove"
                  icon={<Icon as={BiMinus} />}
                />
              </HStack>
            </SimpleGrid>
          ))
        ) : (
          <Text width="100%" textAlign="center" color="mute">
            No Beneficiaries Added yet
          </Text>
        )}
        {!!getIn(errors, "beneficiaries") &&
        !!getIn(touched, "beneficiaries") ? (
          <Text width="100%" textAlign="center" color="red.300">
            {typeof getIn(errors, "beneficiaries") === "string"
              ? getIn(errors, "beneficiaries")
              : null}
          </Text>
        ) : null}
      </Flex>
      <RequisitionAttachmentForm />
      <FormControl mb={5}>
        <FormLabel>Attention To</FormLabel>
        <UserListPopover
          onSelectUser={onSelectAttentionTo}
          assignees={values.attentionTo || []}
        >
          <Button>Select User</Button>
        </UserListPopover>
        {values.attentionTo?.length ? (
          <Flex direction="column" overflowX="auto">
            <Text my={3}>Attentioned Users</Text>
            <HStack spacing={1}>
              {values.attentionTo.map((userid, i) => (
                <Avatar
                  key={`attention-${i}`}
                  src={usersMap[userid]?.photoUrl || ""}
                  name={usersMap[userid]?.displayName || ""}
                />
              ))}
            </HStack>
          </Flex>
        ) : null}
      </FormControl>
      <Flex direction="row" justifyContent="space-between">
        <Button
          onClick={() => setFieldValue("step", 2)}
          variant="outline"
          colorScheme="brand"
        >
          Previous
        </Button>
        <Button colorScheme="brand" type="submit" isLoading={isSubmitting}>
          Submit Requisition
        </Button>
      </Flex>
      <datalist id="vendorlist">
        {Object.keys(vendors).length
          ? Object.values(vendors).map(({ accountNumber, name, bank }) => (
              <option
                key={`account-${accountNumber}`}
              >{`${name} - ${accountNumber} - ${bank}`}</option>
            ))
          : null}
      </datalist>
    </Flex>
  );
};
