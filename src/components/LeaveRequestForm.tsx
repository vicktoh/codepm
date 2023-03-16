import {
  Avatar,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { Form, Formik } from "formik";
import React, { FC, useMemo } from "react";

import * as yup from "yup";
import { BASE_URL } from "../constants";
import { leaveMapper } from "../helpers";
import { useLeaveData } from "../hooks/useLeaveData";
import { useAppSelector } from "../reducers/types";
import { sendNotification } from "../services/notificationServices";
import { sendEmailNotification } from "../services/userServices";
import { LeaveType, Request } from "../types/Permission";
import { LeaveTypeMap } from "../types/System";
import { UserListPopover } from "./UserListPopover";

type LeaveRequestFormProps = {
  onSubmit: (
    values: Omit<Request, "status" | "type" | "userId" | "timestamp">,
  ) => Promise<void>;
  mode?: "add" | "edit";
  request?: Request;
  onEdit?: (values: Request) => Promise<void>;
  onClose: () => void;
};
export const LeaveRequestForm: FC<LeaveRequestFormProps> = ({
  onSubmit,
  request,
  onEdit,
  mode,
  onClose,
}) => {
  const toast = useToast();
  const { users, auth, system } = useAppSelector(({ users, auth, system }) => ({
    users,
    auth,
    system,
  }));
  const { leaveCategory } = useLeaveData(auth?.uid || "");
  const { usersMap = {} } = users || {};
  const leaveDaysAllowed = useMemo(() => {
    if (!system) return {} as LeaveTypeMap;
    return leaveMapper(system);
  }, [system]);
  const initialValues: Omit<
    Request,
    "status" | "type" | "userId" | "timestamp"
  > = {
    startDate: request?.startDate || "",
    endDate: request?.endDate || "",
    leaveType: request?.leaveType || undefined,
    attentionToId: request?.attentionToId || "",
    memo: request?.memo || "",
    handoverId: request?.handoverId || "",
  };
  const validationSchema = yup.object().shape({
    memo: yup.string().required("You must provide a leave memo"),
    startDate: yup
      .date()
      .max(yup.ref("endDate"), "Must be before end date")
      .required(),
    endDate: yup
      .date()
      .min(yup.ref("startDate"), "Cannot be before start date")
      .required(),
    leaveType: yup.string().required(),
    attentionToId: yup.string().required("Must select a supervisor to approve"),
    handoverId: yup.string().required("Must select who you will handover to"),
  });
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        try {
          if (mode === "add") {
            await onSubmit(values);
          }
          if (mode === "edit" && onEdit && request) {
            await onEdit({ ...(request || {}), ...values, status: "pending" });
          }
          if (values.attentionToId) {
            const attentionToName =
              usersMap[values.attentionToId]?.displayName || "";
            const message = `${
              auth?.displayName || ""
            } is requesting for leave from ${format(
              new Date(values.startDate),
              "do MMM yyy",
            )} to ${format(new Date(values.endDate), "do MMM yyy")}`;
            const today = format(new Date(), "do MMM yyy");
            const emailAttentionTo = `${attentionToName} <${
              usersMap[values.attentionToId]?.email || ""
            }>`;
            sendEmailNotification({
              to: emailAttentionTo,
              data: {
                action: `${BASE_URL}/requests-admin`,
                title: "Leave Request",
                message,
                date: today,
              },
            });
            sendNotification({
              read: false,
              reciepientId: values.attentionToId,
              description: `Your attention is needed in a leave request by ${
                auth?.displayName || ""
              }`,
              title: "Leave Request",
              timestamp: Timestamp.now(),
              linkTo: "/requests-admin",
              type: "request",
            });
            // values.handoverId &&
            //   sendNotification({
            //     read: false,
            //     reciepientId: values.handoverId,
            //     description: `You have been mentioned in a leave request by ${
            //       auth?.displayName || "Unknown"
            //     }, the of ${
            //       auth?.displayName || "Unknown"
            //     } duties and responsibilities will be handed over to you`,
            //     title: "Leave Request",
            //     timestamp: Timestamp.now(),
            //     linkTo: "/requests-admin",
            //     type: "request",
            //   });
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
        setFieldValue,
      }) => (
        <Form>
          <Flex direction="column" py={4} px={1}>
            <FormControl mb={3} isInvalid={!!touched.memo && !!errors.memo}>
              <FormLabel>Leave Memo</FormLabel>
              <Textarea
                name="memo"
                value={values.memo}
                onChange={handleChange}
                onBlur={handleBlur}
              ></Textarea>
              <FormErrorMessage>{touched.memo && errors.memo}</FormErrorMessage>
            </FormControl>
            <SimpleGrid columns={[1, 2]} gap={3}>
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
            </SimpleGrid>
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
                <option value="" selected disabled>
                  Select leave type
                </option>
                {Object.values(LeaveType).map((leaveType, i) => (
                  <option key={`leave-type-${i}`} value={leaveType}>
                    {leaveType}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>
                {touched.leaveType && errors.leaveType}
              </FormErrorMessage>
              <FormHelperText>
                {values.leaveType && system
                  ? `${
                      leaveDaysAllowed[values.leaveType] -
                      (leaveCategory[values.leaveType]?.length || 0)
                    } day(s) remaining`
                  : null}
              </FormHelperText>
            </FormControl>
            <FormControl
              mb={3}
              isInvalid={!!touched.attentionToId && !!errors.attentionToId}
            >
              <FormLabel>Handing Over to</FormLabel>
              <Flex direction="column">
                {values.handoverId ? (
                  <Flex direction="column" justifyContent="center" padding={3}>
                    <Avatar
                      size="sm"
                      src={usersMap[values.handoverId]?.photoUrl}
                      name={
                        usersMap[values.handoverId]?.displayName ||
                        "Unknown User"
                      }
                    />
                    <Heading fontSize="sm" mt={3}>
                      {usersMap[values.handoverId]?.displayName ||
                        "Unknown User"}
                    </Heading>
                  </Flex>
                ) : null}
              </Flex>
              <UserListPopover
                onSelectUser={(userId) => {
                  setFieldValue("handoverId", userId);
                }}
                assignees={values.handoverId ? [values.handoverId] : []}
                closeOnSelect={true}
              >
                <Input readOnly placeholder="Select Colleauge" />
              </UserListPopover>
              <FormErrorMessage>
                {touched.handoverId && errors.handoverId}
              </FormErrorMessage>
            </FormControl>
            <FormControl
              mb={3}
              isInvalid={!!touched.attentionToId && !!errors.attentionToId}
            >
              <FormLabel>Department Head</FormLabel>
              <Flex direction="column">
                {values.attentionToId ? (
                  <Flex direction="column" justifyContent="center" padding={3}>
                    <Avatar
                      size="sm"
                      src={usersMap[values.attentionToId]?.photoUrl}
                      name={
                        usersMap[values.attentionToId]?.displayName ||
                        "Unknown User"
                      }
                    />
                    <Heading fontSize="sm" mt={3}>
                      {usersMap[values.attentionToId]?.displayName ||
                        "Unknown User"}
                    </Heading>
                  </Flex>
                ) : null}
              </Flex>
              <UserListPopover
                onSelectUser={(userId) => {
                  setFieldValue("attentionToId", userId);
                }}
                assignees={values.attentionToId ? [values.attentionToId] : []}
                closeOnSelect={true}
              >
                <Input readOnly placeholder="Select Dept. Head" />
              </UserListPopover>
              <FormErrorMessage>
                {touched.attentionToId && errors.attentionToId}
              </FormErrorMessage>
            </FormControl>
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={isSubmitting}
              isFullWidth
              disabled={
                values.leaveType
                  ? (leaveDaysAllowed[values.leaveType || ""] || 0) -
                      (leaveCategory[values.leaveType]?.length || 0) <
                    1
                  : true
              }
            >
              Submit
            </Button>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};
