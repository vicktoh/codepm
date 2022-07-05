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

type FilterFormType = {
  startDate: string;
  endDate: string;
};
export const LogFilterForm: FC = () => {
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });
  const initialValues: FilterFormType = {
    startDate: "",
    endDate: "",
  };
  const validationSchema = yup.object().shape({
    startDate: yup
      .date()
      .max(new Date(), "Start date cannot be further in the future"),
    endDate: yup
      .date()
      .min(yup.ref("startDate"), "Cannot be before startDate")
      .min(new Date(), "cannot be before in the future"),
  });

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={(values, { setSubmitting }) => {
        console.log(values);
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur }) => (
        <Flex direction="column">
          <Heading fontSize="lg" mb={5}>
            Filter Logs
          </Heading>
          <Form>
            <SimpleGrid columns={[1, 2, 2]} spacing={[0, 4, 4]}>
              <FormControl>
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
                  {touched.startDate && touched.startDate}
                </FormErrorMessage>
              </FormControl>
              <FormControl>
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
                  {touched.endDate && touched.endDate}
                </FormErrorMessage>
              </FormControl>
            </SimpleGrid>
            <Button colorScheme="brand" my={2}>
              Filter
            </Button>
          </Form>
        </Flex>
      )}
    </Formik>
  );
};
