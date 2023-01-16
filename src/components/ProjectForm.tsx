import React, { FC } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import * as yup from "yup";
import { Form, Formik } from "formik";
import { addProject, editProject } from "../services/projectServices";
import { Project } from "../types/Project";
import { useAppSelector } from "../reducers/types";

type ProjectFormType = {
  onClose: () => void;
  mode: "add" | "edit";
  onEdit: (project: Project) => void;
  onAddProject: (project: Project) => void;
  project?: Project;
  search?: () => void;
};
export const ProjectForm: FC<ProjectFormType> = ({
  onClose = () => null,
  mode,
  project,
  onEdit,
  search,
  onAddProject,
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
      .max(1500, "Cannot be above 1500 characters"),
    funder: yup.string().required("This field is required"),
  });
  const initialValues: Omit<Project, "id" | "dateAdded"> = {
    title: project?.title || "",
    description: project?.description || "",
    funder: project?.funder || "",
    budgetAccess: project?.budgetAccess || [],
    writeAccess: project?.writeAccess || [],
    creatorId: auth?.uid || "",
  };

  return (
    <Formik
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        if (mode === "add") {
          try {
            const projectId = await addProject(values, auth?.uid || "");
            const newProject: Project = {
              ...values,
              creatorId: auth?.uid || "",
              dateAdded: new Date().getTime(),
              id: projectId,
            };
            onAddProject(newProject);
            toast({ title: "Successfully added project", status: "success" });
            // if (search) search();
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
            await editProject(values);
            toast({ title: "Successfully edited project", status: "success" });
            const newProject = { ...project, ...values } as Project;
            onEdit(newProject);
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
