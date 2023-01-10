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
  useToast,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { FC, useMemo } from "react";

import * as yup from "yup";
import { leaveMapper } from "../helpers";
import { useLeaveData } from "../hooks/useLeaveData";
import { useAppSelector } from "../reducers/types";
import { LeaveType, Request } from "../types/Permission";
import { LeaveTypeMap } from "../types/System";
import { UserListPopover } from "./UserListPopover";

type LeaveRequestFormProps = {
  onSubmit: (
    values: Omit<Request, "status" | "type" | "userId" | "timestamp">,
  ) => Promise<void>;
};
export const LeaveRequestForm: FC<LeaveRequestFormProps> = ({ onSubmit }) => {
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
    startDate: "",
    endDate: "",
    leaveType: undefined,
    attentionToId: "",
  };
  const validationSchema = yup.object().shape({
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
  });
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        try {
          await onSubmit(values);
          toast({
            title: "Request successfully submitted",
            description:
              "Your request has been submitted you'll get a notificaiton when it is approved or declined",
            status: "success",
          });
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
              isInvalid={!!touched.leaveType && !!errors.leaveType}
            >
              <FormLabel>Department Head</FormLabel>
              <Flex direction="column">
                {values.attentionToId ? (
                  <Flex direction="column" justifyContent="center" padding={3}>
                    <Avatar
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
                {touched.leaveType && errors.leaveType}
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
