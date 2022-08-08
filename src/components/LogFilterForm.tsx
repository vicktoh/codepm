import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { FC } from "react";
import * as yup from "yup";
import { Period } from "../types/Permission";

type FilterFormType = {
  startDate: string;
  endDate: string;
};
type LogFilterProps = {
  onFilter: (period: Period) => void;
};
export const LogFilterForm: FC<LogFilterProps> = ({ onFilter }) => {
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });
  const initialValues: FilterFormType = {
    startDate: "",
    endDate: "",
  };
  const validationSchema = yup.object().shape({
    startDate: yup
      .date()
      .required()
      .max(new Date(), "Start date cannot be further in the future"),
    endDate: yup
      .date()
      .required()
      .min(yup.ref("startDate"), "Cannot be before startDate")
      .max(new Date(), "cannot be before in the future"),
  });

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={(values, { resetForm }) => {
        console.log("i am submitting");
        onFilter(values);
        resetForm();
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur }) => (
        <Flex direction="column">
          <Heading fontSize="lg" mb={5}>
            Filter Logs
          </Heading>
          <Form>
            <SimpleGrid columns={[1, 2, 2]} spacing={[0, 4, 4]}>
              <FormControl
                isInvalid={!!touched.startDate && !!errors.startDate}
              >
                <FormLabel>Start date</FormLabel>
                <Input
                  name="startDate"
                  size={isMobile ? "sm" : "md"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.startDate}
                  type="date"
                />
                <FormErrorMessage>
                  {touched.startDate && errors.startDate}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!touched.endDate && !!errors.endDate}>
                <FormLabel>End date</FormLabel>
                <Input
                  name="endDate"
                  size={isMobile ? "sm" : "md"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.endDate}
                  type="date"
                />
                <FormErrorMessage>
                  {touched.endDate && errors.endDate}
                </FormErrorMessage>
              </FormControl>
            </SimpleGrid>
            <Button type="submit" colorScheme="brand" my={2}>
              Filter
            </Button>
          </Form>
        </Flex>
      )}
    </Formik>
  );
};
