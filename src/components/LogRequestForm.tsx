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
import { Timestamp } from "firebase/firestore";
import { Form, Formik } from "formik";
import { request } from "http";
import React, { FC } from "react";

import * as yup from "yup";
import { useAppSelector } from "../reducers/types";
import { sendNotificationToGroup } from "../services/userServices";
import { Notification } from "../types/Notification";
import { Period, Request } from "../types/Permission";
import { UserRole } from "../types/Profile";

type LogRequestFormProps = {
  request?: Request;
  mode?: "add" | "edit";
  onEdit?: (log: Request) => Promise<void>;
  type: Request["type"];
  onSubmit: (
    duration: Omit<Request, "userId" | "status" | "timestamp">,
  ) => Promise<string>;
  onClose: () => void;
};
export const LogRequestForm: FC<LogRequestFormProps> = ({
  type,
  onSubmit,
  onClose,
  request,
  onEdit,
  mode = "add",
}) => {
  const toast = useToast();
  const { userId, status, timestamp, ...rest } = request || {};
  const { auth } = useAppSelector(({ auth }) => ({ auth }));
  const initialValues: Omit<Request, "userId" | "status" | "timestamp"> = {
    startDate: "",
    endDate: "",
    type,
    memo: "",
    ...(rest || {}),
  };
  const validationSchema = yup.object().shape({
    startDate: yup
      .date()
      .max(yup.ref("endDate"), "Must be before end date")
      .required(),
    memo: yup.string().min(10, "Must be at least 10 characters"),
    endDate: yup
      .date()
      .min(yup.ref("startDate"), "Cannot be before start date")
      .required(),
  });
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        let newId = "";
        try {
          if (mode === "add") {
            newId = await onSubmit(values);
            const notification: Notification = {
              read: false,
              title: "Log Request",
              description: `${
                auth?.displayName || "Unknown"
              } is requesting access to logs from ${values.startDate} to ${
                values.endDate
              }`,
              reciepientId: "",
              timestamp: Timestamp.now(),
              type: "request",
              linkTo:
                newId || request?.id
                  ? `/requests-admin/${newId || request?.id}`
                  : "/requests-admin",
            };
            sendNotificationToGroup({
              group: UserRole.admin,
              data: notification,
            });
          }
          if (mode === "edit" && request && onEdit) {
            await onEdit({ ...request, ...values });
          }
          toast({
            title: `Request successfully ${
              mode === "edit" ? "edited" : "submitted"
            }`,
            description:
              "Your request has been submitted you'll get a notificaiton when it is approved or declined",
            status: "success",
          });
          onClose();
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
            <FormControl mb={3} isInvalid={!!touched.memo && !!errors.memo}>
              <FormLabel>Request Memo</FormLabel>
              <Textarea
                name="memo"
                value={values.memo}
                onChange={handleChange}
                onBlur={handleBlur}
              ></Textarea>
            </FormControl>
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
