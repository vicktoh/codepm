import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  SimpleGrid,
  Textarea,
  useToast,
  Tooltip,
  Avatar,
  VStack,
  Text,
} from "@chakra-ui/react";
import { format, setHours } from "date-fns";
import sub from "date-fns/sub";
import { Timestamp } from "firebase/firestore";
import { Form, Formik } from "formik";
import React, { FC } from "react";
import { RiDraftFill } from "react-icons/ri";

import * as yup from "yup";
import { useAppSelector } from "../reducers/types";
import { sendNotification } from "../services/notificationServices";
import { sendNotificationToGroup } from "../services/userServices";
import {
  sendVehicleRequest,
  updateVehicleRquest,
} from "../services/vehicleServices";
import { Notification } from "../types/Notification";
import { Period, Request } from "../types/Permission";
import { UserRole } from "../types/Profile";
import { VehicleRequest } from "../types/VehicleRequest";
import { UserListPopover } from "./UserListPopover";

type VehicleRequestFormProps = {
  request?: VehicleRequest;
  mode?: "add" | "edit";
  onClose: () => void;
};
type VehicleFormRequest = Omit<
  VehicleRequest,
  | "id"
  | "userId"
  | "timestamp"
  | "status"
  | "startTime"
  | "endTime"
  | "datetimestamp"
> & { startTime: string; endTime: string };
export const VehicleRequestForm: FC<VehicleRequestFormProps> = ({
  onClose,
  request,
  mode = "add",
}) => {
  const toast = useToast();
  const { auth, users } = useAppSelector(({ auth, users }) => ({
    auth,
    users,
  }));
  const { usersMap = {} } = users || {};
  const { userId, status, timestamp, startTime, endTime, riders, ...rest } =
    request || {};
  const initialValues: VehicleFormRequest = {
    date: "",
    startTime: startTime ? format(startTime, "kk:mm") : "",
    endTime: endTime ? format(endTime, "kk:mm") : "",
    destination: "",
    origin: "",
    purpose: "",
    reviewerId: "",
    approverId: "",
    ...(rest || {}),
    riders: riders || [auth?.uid || ""],
  };
  const validationSchema = yup.object().shape({
    startTime: yup.string().required("This is a required field"),
    purpose: yup.string().min(10, "Must be at least 10 characters"),
    date:
      mode === "add"
        ? yup
            .date()
            .min(sub(new Date(), { days: 1 }), "Cannot select a past date")
            .required("You must select a date")
        : yup.date().required(),
    destination: yup.string().required("Destination is required"),
    origin: yup.string().required("Location is required"),
    endTime: yup.string().required("This is a required field"),
    reviewerId: yup.string().required("You have to select a reviewer"),
    approverId: yup.string().required("You have to select an approver"),
    riders: yup
      .array()
      .min(1, "You have to select at least one rider")
      .max(4, "Cannot select more than four riders"),
  });
  const onSelectUser = (user: string, riders: string[]) => {
    const riderCopy = [...riders];
    const index = riderCopy.indexOf(user);
    if (index < 0) {
      riderCopy.push(user);
    } else {
      riderCopy.splice(index, 1);
    }
    return riderCopy;
  };
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        let newId = "";
        try {
          if (mode === "add") {
            const { startTime, endTime, ...rest } = values;

            const vehRequest: VehicleRequest = {
              ...rest,
              timestamp: new Date().getTime(),
              userId: auth?.uid || "",
              status: "pending",
              id: "",
              startTime: Date.parse(`${values.date}T${startTime}`),
              endTime: Date.parse(`${values.date}T${endTime}`),
              datetimestamp: new Date(`${values.date}`).getTime(),
            };
            newId = await sendVehicleRequest(vehRequest);
            onClose();
          }
          if (mode === "edit") {
            const { startTime, endTime, ...rest } = values;
            const edit: Partial<VehicleRequest> = {
              ...rest,
              startTime: Date.parse(`${values.date}T${startTime}`),
              endTime: Date.parse(`${values.date}T${endTime}`),
              datetimestamp: new Date(`${values.date}`).getTime(),
            };
            await updateVehicleRquest(edit);
            onClose();
          }
          const notification: Notification = {
            title: `Vehicle Request 🚘`,
            description: `${
              auth?.displayName || "Uknown"
            } is requesting for vehicle on the ${format(
              new Date(values.date),
              "do MMM Y",
            )} to ${values.destination} from ${values.startTime} to ${
              values.endTime
            } and needs to to review thier request`,
            timestamp: Timestamp.now(),
            read: false,
            reciepientId: values.reviewerId,
            linkTo:
              newId || request?.id
                ? `requests-admin/vehicle/${newId || request?.id}`
                : "/requests-admin/vehicle",
            type: "request",
          };
          sendNotification(notification);
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
            {console.log(values)}
            <FormControl
              mb={3}
              isInvalid={!!touched.purpose && !!errors.purpose}
            >
              <FormLabel>Purpose</FormLabel>
              <Input
                type="text"
                name="purpose"
                value={values.purpose}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormControl mb={3} isInvalid={!!touched.date && !!errors.date}>
              <FormLabel>Date</FormLabel>
              <Input
                name="date"
                onChange={handleChange}
                type="date"
                onBlur={handleBlur}
                value={values.date}
              />
              <FormErrorMessage>{touched.date && errors.date}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.riders} mb={3}>
              <FormLabel>Riders</FormLabel>
              <HStack spacing={-1} my={2}>
                {values.riders.length &&
                  values.riders.map((userid) => (
                    <Tooltip
                      label={usersMap[userid]?.displayName || ""}
                      key={`rider-${userid}`}
                    >
                      <Avatar
                        src={usersMap[userid]?.photoUrl || ""}
                        name={usersMap[userid]?.displayName || ""}
                        size="sm"
                      />
                    </Tooltip>
                  ))}
              </HStack>
              <UserListPopover
                assignees={values.riders}
                onSelectUser={(userId) =>
                  setFieldValue("riders", onSelectUser(userId, values.riders))
                }
              >
                <Button size="sm">Select Riders</Button>
              </UserListPopover>
              <FormErrorMessage>{errors.riders || ""}</FormErrorMessage>
            </FormControl>
            <SimpleGrid columns={[1, 2]} mb={3} gap={4}>
              <FormControl
                isInvalid={!!touched.startTime && !!errors.startTime}
              >
                <FormLabel>From time</FormLabel>
                <Input
                  type="time"
                  name="startTime"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.startTime}
                />
                <FormErrorMessage>
                  {touched.startTime && errors.startTime}
                </FormErrorMessage>
              </FormControl>
              <FormControl
                mb={3}
                isInvalid={!!touched.endTime && !!errors.endTime}
              >
                <FormLabel>End time</FormLabel>
                <Input
                  type="time"
                  name="endTime"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.endTime}
                />
                <FormErrorMessage>
                  {touched.endTime && errors.endTime}
                </FormErrorMessage>
              </FormControl>
            </SimpleGrid>
            <SimpleGrid columns={[1, 2]} mb={3} gap={4}>
              <FormControl isInvalid={!!touched.origin && !!errors.origin}>
                <FormLabel>From</FormLabel>
                <Input
                  type="text"
                  name="origin"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.origin}
                />
                <FormErrorMessage>
                  {touched.origin && errors.origin}
                </FormErrorMessage>
              </FormControl>
              <FormControl
                mb={3}
                isInvalid={!!touched.destination && !!errors.destination}
              >
                <FormLabel>Destination</FormLabel>
                <Input
                  type="text"
                  name="destination"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.destination}
                />
                <FormErrorMessage>
                  {touched.destination && errors.destination}
                </FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={[1, 2]} mb={3} gap={4}>
              <FormControl isInvalid={!!errors.reviewerId}>
                {values.reviewerId ? (
                  <VStack alignItems="center">
                    <Avatar
                      src={usersMap[values.reviewerId]?.photoUrl || ""}
                      name={
                        usersMap[values.reviewerId]?.displayName ||
                        "Unknown User"
                      }
                      size="sm"
                    />
                    <Text fontSize="sm">
                      {usersMap[values.reviewerId]?.displayName ||
                        "Unknown User"}
                    </Text>
                  </VStack>
                ) : null}
                <UserListPopover
                  assignees={values.reviewerId ? [values.reviewerId] : []}
                  onSelectUser={(userId) => setFieldValue("reviewerId", userId)}
                  closeOnSelect={true}
                >
                  <Button size="sm" isFullWidth>
                    Select Reviewer
                  </Button>
                </UserListPopover>
                <FormErrorMessage>{values.reviewerId}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.approverId}>
                {values.approverId ? (
                  <VStack alignItems="center">
                    <Avatar
                      src={usersMap[values.approverId]?.photoUrl || ""}
                      name={
                        usersMap[values.approverId]?.displayName ||
                        "Unknown User"
                      }
                      size="sm"
                    />
                    <Text fontSize="sm">
                      {usersMap[values.approverId]?.displayName ||
                        "Unknown User"}
                    </Text>
                  </VStack>
                ) : null}
                <UserListPopover
                  assignees={values.approverId ? [values.approverId] : []}
                  onSelectUser={(userId) => setFieldValue("approverId", userId)}
                  closeOnSelect={true}
                >
                  <Button size="sm" isFullWidth>
                    Select Approver
                  </Button>
                </UserListPopover>
                <FormErrorMessage>{errors.approverId}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

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
