import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { Form, Formik } from "formik";
import React, { FC, useMemo } from "react";
import * as yup from "yup";
import { useAppSelector } from "../reducers/types";
import {
  newLogDay,
  removeLogActivity,
  updateLogActivity,
} from "../services/logsServices";
import { LogFormType } from "../types/Log";
type LogFormProps = {
  mode: "add" | "edit";
  logIndex?: number;
  actvityIndex?: number;
};

export const LogForm: FC<LogFormProps> = ({ logIndex, actvityIndex, mode }) => {
  const { auth, logs } = useAppSelector(({ logs, auth }) => ({ logs, auth }));
  const { logMap = {}, logs: logList = [] } = logs || {};
  const toast = useToast();
  const today = useMemo(() => {
    return format(new Date(), "y-MM-dd");
  }, []);
  const initialValues: LogFormType = {
    title:
      mode === "add"
        ? ""
        : logIndex === undefined || actvityIndex === undefined
        ? ""
        : logList[logIndex].activity[actvityIndex],
    date:
      mode === "edit"
        ? logIndex === undefined || actvityIndex === undefined
          ? today
          : logList[logIndex].dateString
        : today,
  };
  const validationSchema = yup.object().shape({
    title: yup.string().required("This field is required"),
    date: yup.string().required("This date is required"),
  });
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        console.log(values);

        if (mode === "add") {
          try {
            if (logMap[values.date]) {
              await updateLogActivity(
                auth?.uid || "",
                values.date,
                values.title,
              );
            } else {
              await newLogDay(auth?.uid || "", values);
            }
          } catch (error) {
            const err: any = error;
            toast({
              title: "Unable to add Log",
              description: err?.message || "Unexpected error",
              status: "error",
            });
          } finally {
            resetForm({ values: { date: today, title: "" } });
          }
        }

        if (mode === "edit") {
          if (logIndex === undefined || actvityIndex === undefined) {
            toast({ title: "No log selected", status: "error" });
            return;
          }
          try {
            const activityCopy = [...logList[logIndex].activity];
            const oldDateString = logList[logIndex].dateString;
            const oldActivity = logList[logIndex].activity[actvityIndex];
            if (logMap[values.date]) {
              if (oldDateString === values.date) {
                activityCopy[actvityIndex] = values.title;
                await updateLogActivity(
                  auth?.uid || "",
                  values.date,
                  activityCopy,
                );
              } else {
                await removeLogActivity(
                  auth?.uid || "",
                  oldDateString,
                  oldActivity,
                );
                await updateLogActivity(
                  auth?.uid || "",
                  values.date,
                  values.title,
                );
              }
            } else {
              await newLogDay(auth?.uid || "", values);
              await removeLogActivity(
                auth?.uid || "",
                oldDateString,
                oldActivity,
              );
            }
          } catch (error) {
            const err: any = error;
            toast({
              title: "Error editing activity",
              description: err?.message || "Unexpected error",
              status: "error",
            });
          } finally {
            resetForm();
          }
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
        <Flex direction="column" px={5}>
          <Form>
            <FormControl
              mb={5}
              isRequired
              isInvalid={!!touched.date && !!errors.date}
            >
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                name="date"
                value={values.date}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <FormErrorMessage>{touched.date && errors.date}</FormErrorMessage>
            </FormControl>
            <FormControl
              mb={5}
              isRequired
              isInvalid={!!touched.title && !!errors.title}
            >
              <FormLabel>Activity</FormLabel>
              <Textarea
                rows={3}
                placeholder="What did you do today"
                name="title"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <FormErrorMessage>
                {touched.title && errors.title}
              </FormErrorMessage>
            </FormControl>
            <Button
              isFullWidth
              colorScheme="brand"
              isLoading={isSubmitting}
              my={4}
              type="submit"
            >
              Submit Log
            </Button>
          </Form>
        </Flex>
      )}
    </Formik>
  );
};
