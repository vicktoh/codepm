import React, { FC } from "react";
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
import * as yup from "yup";
import { Form, Formik } from "formik";
import { updateProject } from "../services/projectServices";
import { Project, ProjectWorkPlan } from "../types/Project";
import { Timestamp } from "firebase/firestore";
import { WORKPLAN_TYPES } from "../constants";
import { generateId } from "../services/helpers";

type WorkplanFormProps = {
  onClose: () => void;
  mode: "add" | "edit";
  setProject: (project: Project) => void;
  project: Project;
  index?: number;
};
export const WorkplanForm: FC<WorkplanFormProps> = ({
  onClose = () => null,
  mode,
  index,
  project,
  setProject,
}) => {
  const toast = useToast();
  const workplan =
    project?.workplans && index !== undefined ? project.workplans[index] : null;
  const validationSchema = yup.object().shape({
    title: yup
      .string()
      .required("This field is required")
      .min(5, "Must be at least 5 characters"),
    type: yup.string().required("This field is required"),
  });
  const initialValues: Omit<ProjectWorkPlan, "dateAdded" | "id"> = {
    title: workplan?.title || "",
    type: workplan?.type || "Communications",
  };

  return (
    <Formik
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const newPlan: ProjectWorkPlan = {
          title: values.title,
          type: values.type,
          dateAdded: Timestamp.now(),
          id: generateId(10),
        };
        if (mode === "add") {
          try {
            const workplans = [...(project?.workplans || []), newPlan];
            await updateProject(project.id, { workplans });
            setProject({ ...project, ...{ workplans } });
          } catch (error) {
            const err: any = error;
            toast({
              title: "Could not add workplan",
              description: err?.message || "Unknown Error",
              status: "error",
            });
          } finally {
            onClose();
          }
        }
        if (mode === "edit") {
          if (
            index === undefined ||
            !project.workplans ||
            !project.workplans.length
          ) {
            return;
          }
          try {
            const workplans = [...project.workplans];
            const oldWorkplan = workplans[index];

            workplans[index] = { ...oldWorkplan, ...values };
            await updateProject(project.id, { workplans });
            setProject({ ...project, ...{ workplans } });
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
                placeholder="e.g Communications workplan"
              />
              <FormErrorMessage>
                {touched.title && errors.title}
              </FormErrorMessage>
            </FormControl>

            <FormControl
              isRequired
              isInvalid={!!touched.type && !!errors.type}
              mb={3}
            >
              <FormLabel>Type</FormLabel>
              <Select
                value={values.type}
                name="type"
                onChange={handleChange}
                onBlur={handleBlur}
              >
                {WORKPLAN_TYPES.map((workplan, i) => (
                  <option key={`workplan_type_${i}`} value={workplan}>
                    {workplan}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{touched.type && errors.type}</FormErrorMessage>
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
