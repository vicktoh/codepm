import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  SimpleGrid,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { Form, Formik } from "formik";
import React, { FC } from "react";

import * as yup from "yup";
import { useAppSelector } from "../reducers/types";
import {
  sendVehicleRequest,
  updateVehicleRquest,
} from "../services/vehicleServices";
import { Period, Request } from "../types/Permission";
import { VehicleRequest } from "../types/VehicleRequest";

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
  const { auth } = useAppSelector(({ auth }) => ({ auth }));
  const { userId, status, timestamp, startTime, endTime, ...rest } =
    request || {};
  const initialValues: VehicleFormRequest = {
    date: "",
    startTime: startTime ? format(startTime, "kk:mm") : "",
    endTime: endTime ? format(endTime, "kk:mm") : "",
    destination: "",
    origin: "",
    purpose: "",
    ...(rest || {}),
  };
  const validationSchema = yup.object().shape({
    startTime: yup.string().required("This is a required field"),
    purpose: yup.string().min(10, "Must be at least 10 characters"),
    date: yup
      .date()
      .min(new Date(), "Cannot select a past date")
      .required("You must select a date"),
    destination: yup.string().required("Destination is required"),
    origin: yup.string().required("Location is required"),
    endTime: yup.string().required("This is a required field"),
  });
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        try {
          if (mode === "add") {
            const { startTime, endTime, ...rest } = values;

            const vehRequest: VehicleRequest = {
              ...rest,
              timestamp: new Date().getTime(),
              userId: auth?.uid || "",
              status: "pending",
              id: "",
              startTime: new Date(`${values.date} ${startTime}`).getTime(),
              endTime: new Date(`${values.date} ${endTime}`).getTime(),
              datetimestamp: new Date(`${values.date}`).getTime(),
            };
            await sendVehicleRequest(vehRequest);
            onClose();
          }
          if (mode === "edit") {
            const { startTime, endTime, ...rest } = values;
            const edit: Partial<VehicleRequest> = {
              ...rest,
              startTime: new Date(`${values.date} ${startTime}`).getTime(),
              endTime: new Date(`${values.date} ${endTime}`).getTime(),
              datetimestamp: new Date(`${values.date}`).getTime(),
            };
            await updateVehicleRquest(edit);
            onClose();
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
              <FormErrorMessage>
                {touched.date && touched.date}
              </FormErrorMessage>
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
