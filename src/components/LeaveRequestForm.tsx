import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  useToast,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { FC } from "react";

import * as yup from "yup";
import { LeaveType, Request } from "../types/Permission";

type LeaveRequestFormProps = {
  onSubmit: (
    values: Omit<Request, "status" | "type" | "userId" | "timestamp">,
  ) => Promise<void>;
};
export const LeaveRequestForm: FC<LeaveRequestFormProps> = ({ onSubmit }) => {
  const toast = useToast();
  const initialValues: Omit<
    Request,
    "status" | "type" | "userId" | "timestamp"
  > = {
    startDate: "",
    endDate: "",
    leaveType: undefined,
  };
  const validationSchema = yup.object().shape({
    startDate: yup
      .date()
      .max(yup.ref("endDate"), "Must be before end date")
      .required(),
    endDate: yup
      .date()
      .min(yup.ref("startDate"), "Cannot be before start date")
      .required(),
    leaveType: yup.string().required(),
  });
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        try {
          await onSubmit(values);
          toast({
            title: "Request successfully submitted",
            description:
              "Your request has been submitted you'll get a notificaiton when it is approved or declined",
            status: "success",
          });
        } catch (error) {
          const err: any = error;
          toast({
            title: "Could not complete Request",
            description: err?.message || "Unexpected error",
            status: "error",
          });
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        isSubmitting,
      }) => (
        <Form>
          <Flex direction="column" py={4} px={1}>
            <FormControl
              mb={3}
              isInvalid={!!touched.startDate && !!errors.startDate}
            >
              <FormLabel>Start Date</FormLabel>
              <Input
                name="startDate"
                onChange={handleChange}
                type="date"
                onBlur={handleBlur}
                value={values.startDate}
              />
              <FormErrorMessage>
                {touched.startDate && touched.startDate}
              </FormErrorMessage>
            </FormControl>
            <FormControl
              mb={3}
              isInvalid={!!touched.startDate && !!errors.startDate}
            >
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
            <FormControl
              mb={3}
              isInvalid={!!touched.leaveType && !!errors.leaveType}
            >
              <FormLabel>Leave Type</FormLabel>
              <Select
                name="leaveType"
                value={values.leaveType}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                {Object.values(LeaveType).map((leaveType, i) => (
                  <option key={`leave-type-${i}`} value={leaveType}>
                    {leaveType}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>
                {touched.leaveType && errors.leaveType}
              </FormErrorMessage>
            </FormControl>
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={isSubmitting}
              isFullWidth
            >
              Submit
            </Button>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};
