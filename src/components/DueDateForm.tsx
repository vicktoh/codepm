import React, { FC } from "react";
import { TimePeriod } from "../types/Project";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import * as yup from "yup";
import { Form, Formik } from "formik";

type DueDateFormProps = {
  onSubmit: (values: TimePeriod) => void;
  timePeriod?: TimePeriod;
  onClose: () => void;
};

export const DueDateForm: FC<DueDateFormProps> = ({
  onSubmit,
  timePeriod,
  onClose,
}) => {
  const initialValues: TimePeriod = {
    startDate: timePeriod?.startDate || "",
    dueDate: timePeriod?.dueDate || "",
  };
  const validationSchema = yup.object().shape({
    startDate: yup.date(),
    dueDate: yup
      .date()
      .min(yup.ref("startDate"), "Can not be before the start date"),
  });
  return (
    <Box px={3} py={3}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          onSubmit(values);
          setSubmitting(false);
        }}
      >
        {({
          handleBlur,
          handleChange,
          values,
          errors,
          touched,
          isSubmitting,
        }) => (
          <Form>
            <FormControl
              mb={3}
              isInvalid={!!touched.startDate && !!errors.startDate}
            >
              <FormLabel>Start date</FormLabel>
              <Input
                name="startDate"
                value={values.startDate}
                onChange={handleChange}
                onBlur={handleBlur}
                type="date"
              />
              <FormErrorMessage>
                {touched.startDate && errors.startDate}
              </FormErrorMessage>
            </FormControl>
            <FormControl
              mb={3}
              isRequired
              isInvalid={!!touched.dueDate && !!errors.dueDate}
            >
              <FormLabel>Due date</FormLabel>
              <Input
                name="dueDate"
                value={values.dueDate}
                onChange={handleChange}
                onBlur={handleBlur}
                type="date"
              />
              <FormErrorMessage>
                {touched.dueDate && errors.dueDate}
              </FormErrorMessage>
            </FormControl>
            <Button
              mt={5}
              mr={2}
              variant="solid"
              type="submit"
              isLoading={isSubmitting}
            >
              Save
            </Button>
            <Button mt={5} variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};
