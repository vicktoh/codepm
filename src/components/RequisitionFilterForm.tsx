import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react";
import React, { FC } from "react";
import {
  Requisition,
  RequisitionStatus,
  RequisitionType,
} from "../types/Requisition";
import * as yup from "yup";
import { Formik, Form } from "formik";
export type RequisitionFilterType = {
  type: RequisitionType | "";
  startDate: string;
  endDate: string;
  status: Requisition["status"] | "";
};
export const RequisitionFilterForm: FC<{
  confirm: (reflection: RequisitionFilterType) => void;
  filter?: RequisitionFilterType;
}> = ({ confirm, filter }) => {
  const initialValues: RequisitionFilterType = {
    type: filter?.type || "",
    startDate: filter?.startDate || "",
    endDate: filter?.endDate || "",
    status: filter?.status || "",
  };
  const inputSize = useBreakpointValue({ base: "sm", md: "md", lg: "md" });
  const validationSchema = yup.object().shape({
    projectId: yup.string(),
    startDate: yup.date().max(yup.ref("endDate"), "cannot be after end date"),
    endDate: yup
      .date()
      .min(yup.ref("startDate"), "cannot be before start date"),
    status: yup.string(),
  });
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        console.log(values);
        confirm(values);
      }}
    >
      {({ values, touched, errors, handleChange, handleBlur }) => (
        <Flex>
          <Form>
            <SimpleGrid columns={[1, 2]} mb={4} gridGap={3}>
              <FormControl
                isInvalid={!!touched.startDate && !!errors.startDate}
              >
                <FormLabel>Start Date</FormLabel>
                <Input
                  size={inputSize}
                  bg="white"
                  type="date"
                  name="startDate"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.startDate}
                />
                <FormErrorMessage>
                  {touched.startDate && errors.startDate}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!touched.endDate && !!errors.endDate}>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="date"
                  size={inputSize}
                  bg="white"
                  name="endDate"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.endDate}
                />
                <FormErrorMessage>
                  {touched.endDate && errors.endDate}
                </FormErrorMessage>
              </FormControl>
              <FormControl mb={3} isInvalid={!!touched.type && !!errors.type}>
                <FormLabel>Requisition Type</FormLabel>
                <Select
                  name="type"
                  value={values.type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  bg="white"
                  size={inputSize}
                >
                  <option value="">All</option>
                  {Object.values(RequisitionType).map((value, i) => (
                    <option key={`type-${value}-${i}`} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>
                  {touched.type && errors.type}
                </FormErrorMessage>
              </FormControl>
              <FormControl mb={3} isInvalid={!!touched.type && !!errors.type}>
                <FormLabel>Requisition Status</FormLabel>
                <Select
                  name="status"
                  size={inputSize}
                  bg="white"
                  value={values.status}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">All</option>
                  {Object.values(RequisitionStatus).map((value, i) => (
                    <option key={`type-${value}-${i}`} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>
                  {touched.type && errors.type}
                </FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <Button size="sm" colorScheme="brand" isFullWidth type="submit">
              Filter
            </Button>
          </Form>
        </Flex>
      )}
    </Formik>
  );
};
