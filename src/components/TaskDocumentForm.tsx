import React, { FC } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import * as yup from "yup";
import { Form, Formik } from "formik";
import { Document } from "../types/Project";

type DocumentFormProps = {
  onSubmit: (value: Document) => void;
  document?: Document;
  onClose: () => void;
};
export const TaskDocumentForm: FC<DocumentFormProps> = ({
  onSubmit,
  document,
  onClose,
}) => {
  const validationSchema = yup.object().shape({
    title: yup
      .string()
      .required("This field is required")
      .min(5, "Must be at least 5 characters"),
    url: yup
      .string()
      .required("This field is required")
      .url("Must be a valid url"),
  });
  const initialValues: Document = {
    title: document?.title || "",
    url: document?.url || "",
  };

  return (
    <Formik
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        onSubmit(values);
        onClose();
      }}
      initialValues={initialValues}
    >
      {({
        handleBlur,
        handleChange,
        values,
        touched,
        errors,
        isSubmitting,
        setFieldValue,
      }) => (
        <Flex direction="column" px={3} pb={5}>
          <Form>
            <FormControl
              isRequired
              isInvalid={!!touched.title && !!errors.title}
              mb={3}
            >
              <FormLabel>Title</FormLabel>
              <Input
                size="sm"
                name="title"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <FormErrorMessage>
                {touched.title && errors.title}
              </FormErrorMessage>
            </FormControl>

            <FormControl
              isRequired
              isInvalid={!!touched.url && !!errors.url}
              mb={3}
            >
              <FormLabel>URL</FormLabel>
              <Input
                name="url"
                value={values.url}
                onChange={handleChange}
                onBlur={handleBlur}
                type="url"
                size="sm"
              />
              <FormErrorMessage>{touched.url && errors.url}</FormErrorMessage>
            </FormControl>

            <Flex direction="column" mt={3}>
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={isSubmitting}
              >
                Save
              </Button>
            </Flex>
          </Form>
        </Flex>
      )}
    </Formik>
  );
};
