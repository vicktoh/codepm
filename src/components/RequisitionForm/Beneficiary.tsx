import {
  Avatar,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useFormikContext } from "formik";
import React from "react";
import { useAppSelector } from "../../reducers/types";
import { RequisitionFormValues } from "../../types/Requisition";
import { UserListPopover } from "../UserListPopover";

export const Beneficiary = () => {
  const { values, errors, touched, handleBlur, handleChange, setFieldValue } =
    useFormikContext<RequisitionFormValues>();
  const { users } = useAppSelector(({ users }) => ({ users }));
  const { usersMap = {} } = users || {};
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
  return (
    <Flex direction="column" px={5} pb={5}>
      <VStack alignItems="center" mb={5}>
        <Heading fontSize="lg">Beneficiarys</Heading>
        <Text>Step 3 of 3</Text>
      </VStack>

      <FormControl
        isInvalid={!!touched.beneficiaryName && !!errors.beneficiaryName}
        mb={5}
      >
        <FormLabel>Beneficiary Name</FormLabel>
        <Input
          value={values.beneficiaryName}
          name="beneficiaryName"
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <FormErrorMessage>
          {touched.beneficiaryName && errors.beneficiaryName}
        </FormErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={!!touched.beneficiaryBank && !!errors.beneficiaryBank}
        mb={5}
      >
        <FormLabel>Beneficiary Bank</FormLabel>
        <Input
          value={values.beneficiaryBank}
          name="beneficiaryBank"
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <FormErrorMessage>
          {touched.beneficiaryBank && errors.beneficiaryBank}
        </FormErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={
          !!touched.beneficiaryAccountNumber &&
          !!errors.beneficiaryAccountNumber
        }
        mb={5}
      >
        <FormLabel>Beneficiary Account Number</FormLabel>
        <Input
          value={values.beneficiaryAccountNumber}
          name="beneficiaryAccountNumber"
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <FormErrorMessage>
          {touched.beneficiaryAccountNumber && errors.beneficiaryAccountNumber}
        </FormErrorMessage>
      </FormControl>

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
                  src={usersMap[userid].photoUrl || ""}
                  name={usersMap[userid].displayName || ""}
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
        <Button colorScheme="brand" type="submit">
          Submit Requisition
        </Button>
      </Flex>
    </Flex>
  );
};
