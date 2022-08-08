import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useFormikContext } from "formik";
import React from "react";
import {
  RequisitionFormValues,
  RequisitionType,
} from "../../types/Requisition";

export const DetailForm = () => {
  const { values, handleChange, handleBlur, errors, touched, setFieldValue } =
    useFormikContext<RequisitionFormValues>();
  return (
    <Flex direction="column" pb={5} px={5}>
      <VStack>
        <Heading fontSize="lg">Requisition Details</Heading>
        <Text>Step of 1 of 3</Text>
      </VStack>
      <FormControl isInvalid={!!touched.title && !!errors.title} mb={5}>
        <FormLabel>Requisition title</FormLabel>
        <Input
          value={values.title}
          onChange={handleChange}
          name="title"
          onBlur={handleBlur}
        />
        <FormErrorMessage>{touched.title && errors.title}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!touched.date && !!errors.date} mb={5}>
        <FormLabel>Date</FormLabel>
        <Input
          value={values.date}
          onChange={handleChange}
          name="date"
          type="date"
          onBlur={handleBlur}
        />
        <FormErrorMessage>{touched.date && errors.date}</FormErrorMessage>
      </FormControl>
      <FormControl mb={5} isInvalid={!!touched.type && !!errors.type}>
        <FormLabel>Requisition Type</FormLabel>
        <Select
          value={values.type}
          onChange={handleChange}
          onBlur={handleBlur}
          name="type"
        >
          <option value="">Select type</option>
          {Object.values(RequisitionType).map((type, i) => (
            <option key={`requisition-type-${i}`} value={type}>
              {type}
            </option>
          ))}
        </Select>
        <FormErrorMessage>{touched.type && errors.type}</FormErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={!!touched.projectTitle && !!errors.projectTitle}
        mb={5}
      >
        <FormLabel>Project Title</FormLabel>
        <Input
          value={values.projectTitle}
          onChange={handleChange}
          name="projectTitle"
          type="text"
          onBlur={handleBlur}
        />
        <FormErrorMessage>
          {touched.projectTitle && errors.projectTitle}
        </FormErrorMessage>
      </FormControl>
      <FormControl
        isInvalid={!!touched.activityTitle && !!errors.activityTitle}
        mb={5}
      >
        <FormLabel>Project Activity</FormLabel>
        <Input
          value={values.activityTitle}
          onChange={handleChange}
          name="activityTitle"
          type="text"
          onBlur={handleBlur}
        />
        <FormErrorMessage>
          {touched.activityTitle && errors.activityTitle}
        </FormErrorMessage>
      </FormControl>
      <Button
        disabled={!!!values.title || !!!values.type || !!!values.date}
        colorScheme="brand"
        onClick={() => setFieldValue("step", 2)}
        alignSelf="end"
      >
        Next
      </Button>
    </Flex>
  );
};
