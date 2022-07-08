import React, { FC } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  useToast,
} from "@chakra-ui/react";
import * as yup from "yup";
import { Form, Formik } from "formik";
import { addDocument, editDocument } from "../services/projectServices";
import { Project, ProjectDocument } from "../types/Project";
import { useAppSelector } from "../reducers/types";
import { Timestamp } from "firebase/firestore";

type DocumentFormProps = {
  onClose: () => void;
  mode: "add" | "edit";
  project: Project;
  setProject: (newProject: Project) => void;
  index: number | undefined;
};
export const DocumentForm: FC<DocumentFormProps> = ({
  onClose = () => null,
  mode,
  project,
  setProject,
  index,
}) => {
  const document: Partial<ProjectDocument> =
    project?.documents && index !== undefined ? project.documents[index] : {};
  console.log({ document, index, project });
  const auth = useAppSelector(({ auth }) => auth);
  const toast = useToast();
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
  const initialValues: Omit<
    ProjectDocument,
    "dateAdded" | "addedById" | "addedBy"
  > = {
    title: document?.title || "",
    url: document?.url || "",
  };

  return (
    <Formik
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const newDoc: ProjectDocument = {
          title: values.title,
          url: values.url,
          dateAdded: Timestamp.now(),
          addedBy: auth?.displayName || "Unknown User",
          addedById: auth?.uid || "",
        };
        if (mode === "add") {
          try {
            const newProject = await addDocument(newDoc, project);
            setProject(newProject);
          } catch (error) {
            const err: any = error;
            toast({
              title: "Could not add Document",
              description: err?.message || "Unknown Error",
              status: "error",
            });
          } finally {
            onClose();
          }
        }
        if (mode === "edit") {
          if (index === undefined) return;
          try {
            const newdocuments = [...(project.documents || [])];
            newdocuments.splice(index, 1, newDoc);
            await editDocument(newdocuments, project);
            toast({
              title: "Successfully edited document",
              status: "success",
            });
            setProject({ ...project, documents: newdocuments });
          } catch (error) {
            const err: any = error;
            toast({
              title: "Could not edit proposal",
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
