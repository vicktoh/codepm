import React, { FC } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import * as yup from "yup";
import { Form, Formik } from "formik";
import { ProposalType, STATUSES } from "../types/ProposalType";
import { addProposal, editProposal } from "../services/projectServices";
import { useAppSelector } from "../reducers/types";

type ProposalFormType = {
  onClose: () => void;
  mode: "add" | "edit";
  proposal?: ProposalType;
};
export const ProposalForm: FC<ProposalFormType> = ({
  onClose = () => null,
  mode,
  proposal,
}) => {
  const toast = useToast();
  const { auth } = useAppSelector(({ auth }) => ({ auth }));
  const validationSchema = yup.object().shape({
    title: yup
      .string()
      .required("This field is required")
      .min(5, "Must be at least 5 characters"),
    description: yup
      .string()
      .required("This field is required")
      .min(100, "Must be at least 100 digits")
      .max(300, "Cannot be above 300 characters"),
    funder: yup.string().required("This field is required"),
    status: yup.string().required("This field is required"),
    // file: yup.string(),
  });
  const initialValues: ProposalType = {
    title: proposal?.title || "",
    description: proposal?.description || "",
    funder: proposal?.funder || "",
    status: proposal?.status || "",
    // file: undefined,
    documents: proposal?.documents || [],
    dateAdded: 0,
    creatorId: auth?.uid || "",
  };
  return (
    <Formik
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        if (mode === "add") {
          try {
            await addProposal(values, auth?.uid || "");
            toast({ title: "Successfully added proposal", status: "success" });
          } catch (error) {
            const err: any = error;
            toast({
              title: "Could not Add Proposal",
              description: err?.message || "Unknown Error",
              status: "error",
            });
          } finally {
            onClose();
          }
        }
        if (mode === "edit") {
          try {
            await editProposal({ ...proposal, ...values });
            toast({ title: "Successfully edited proposal", status: "success" });
          } catch (error) {
            const err: any = error;
            toast({
              title: "Could not Add Proposal",
              description: err?.message || "Unknown Error",
              status: "error",
            });
          } finally {
            onClose();
          }
        }
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
              isInvalid={!!touched.description && !!errors.description}
              mb={3}
            >
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <FormHelperText>
                Minimum 100 character and Max 300 character
              </FormHelperText>

              <FormErrorMessage>
                {touched.description && errors.description}
              </FormErrorMessage>
            </FormControl>
            <FormControl
              isRequired
              isInvalid={!!touched.funder && !!errors.funder}
              mb={3}
            >
              <FormLabel>Funder</FormLabel>
              <Input
                name="funder"
                value={values.funder}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <FormErrorMessage>
                {touched.funder && errors.funder}
              </FormErrorMessage>
            </FormControl>
            <FormControl
              isRequired
              isInvalid={!!touched.status && !!errors.status}
              mb={3}
            >
              <FormLabel>Status</FormLabel>
              <Select
                placeholder="Select proposal status"
                name="status"
                value={values.status}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                {STATUSES.map((status, i) => (
                  <option value={status} key={`proposal-status-${i}`}>
                    {status}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>
                {touched.status && errors.status}
              </FormErrorMessage>
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
