import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  SimpleGrid,
} from "@chakra-ui/react";
import React from "react";
import { Requisition } from "../types/Requisition";
import * as yup from "yup";
import { Formik, Form } from "formik";
type RequisitionFilterType = {
  projectId: string;
  startDate: string;
  endDate: string;
  status: Requisition["status"] | "";
};
export const RequisitionFilterForm = () => {
  const initialValues: RequisitionFilterType = {
    projectId: "",
    startDate: "",
    endDate: "",
    status: "",
  };
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
      }}
    >
      {({ values, touched, errors, handleChange, handleBlur }) => (
        <Flex>
          <Form>
            <SimpleGrid columns={2}>
              <FormControl
                isInvalid={!!touched.startDate && !!errors.startDate}
              >
                <FormLabel>Start Date</FormLabel>
                <Input
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
                  name="endDate"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.endDate}
                />
                <FormErrorMessage>
                  {touched.endDate && errors.endDate}
                </FormErrorMessage>
              </FormControl>
            </SimpleGrid>
          </Form>
        </Flex>
      )}
    </Formik>
  );
};
