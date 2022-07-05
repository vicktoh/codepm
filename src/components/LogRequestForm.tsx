import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { FC } from "react";

import * as yup from "yup";

type Duration = {
  startDate: string;
  endDate: string;
};
type LogRequestFormProps = {
  type: "leave" | "access";
  onSubmit: (duration: Duration) => void;
};
export const LogRequestForm: FC<LogRequestFormProps> = ({ type, onSubmit }) => {
  const initialValues: Duration = {
    startDate: "",
    endDate: "",
  };
  const validationSchema = yup.object().shape({
    startDate: yup
      .date()
      .max(yup.ref("endDate"), "Must be before end date")
      .required(),
    endDate: yup
      .date()
      .min(yup.ref("startDate"), "Cannot be before start date"),
  });
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, {}) => {
        console.log(values);
      }}
    >
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
      }) => (
        <Form>
          <FormControl
            mb={3}
            isInvalid={!!touched.startDate && !!errors.startDate}
          >
            <FormLabel>Start Date</FormLabel>
            <Input
              name="startDate"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.startDate}
            />
            <FormErrorMessage>
              {touched.startDate && touched.startDate}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!touched.startDate && !!errors.startDate}>
            <FormLabel>End Date</FormLabel>
            <Input
              name="endDate"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.endDate}
            />
            <FormErrorMessage>
              {touched.endDate && touched.endDate}
            </FormErrorMessage>
          </FormControl>
        </Form>
      )}
    </Formik>
  );
};
