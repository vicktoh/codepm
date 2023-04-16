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
  SimpleGrid,
  useToast,
} from "@chakra-ui/react";
import { useAppSelector } from "../reducers/types";
import { Profile } from "../types/Profile";
import * as yup from "yup";
import { Form, Formik } from "formik";
import { useDispatch } from "react-redux";
import { getAuth, updateProfile } from "firebase/auth";
import { updateUserProfile } from "../services/profileServices";
import { setProfile } from "../reducers/profileSlice";
import { updateAuth } from "../reducers/authSlice";
import { firebaseAuth } from "../services/firebase";

const departments: string[] = require("../constants/departments.json");

export const ProfileForm: FC<{ onClose: () => void }> = ({
  onClose = () => null,
}) => {
  const { auth, profile } = useAppSelector(({ auth, profile }) => ({
    auth,
    profile,
  }));
  const dispatch = useDispatch();
  const toast = useToast();
  const validationSchema = yup.object().shape({
    displayName: yup.string().min(5, "Must be at least 5 characters"),
    phoneNumber: yup
      .string()
      .required("This field is required")
      .min(10, "Must be at least 10 digits"),
    designation: yup.string().required("This field is required"),
    dateOfBirth: yup.string().required("This field is required"),
  });
  const initialValues: Omit<Profile, "photoUrl"> = {
    displayName: profile?.displayName || auth?.displayName || "",
    phoneNumber: profile?.phoneNumber || "",
    designation: profile?.designation || "",
    department: profile?.department || "",
    dateOfBirth: profile?.dateOfBirth || "",
    email: firebaseAuth.currentUser?.email || "",
    dateRegistered: auth?.dateRegistered || "",
  };

  return (
    <Formik
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await updateUserProfile(auth?.uid || "", {
            ...(profile || {}),
            ...values,
            ...{
              email: firebaseAuth.currentUser?.email || "",
              dateRegistered: auth?.dateRegistered || "",
            },
          });
          const fireAuth = getAuth();
          fireAuth.currentUser &&
            (await updateProfile(fireAuth.currentUser, {
              displayName: values.displayName,
            }));
          dispatch(setProfile({ ...(profile || {}), ...values }));
          dispatch(
            updateAuth({
              ...(auth || {}),
              displayName: values.displayName,
            }),
          );
          toast({
            title: "Profile successfully updated",
            status: "success",
          });
          onClose();
        } catch (error) {
          const err: any = error;
          toast({
            title: "Error Occured",
            description: err?.message || "Unknown error please try again",
            status: "error",
          });
        } finally {
          setSubmitting(false);
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
      }) => (
        <Flex direction="column" p={5}>
          <Form>
            <FormControl
              isRequired
              isInvalid={!!touched.displayName && !!errors.displayName}
              mb={3}
            >
              <FormLabel>Full name</FormLabel>
              <Input
                name="displayName"
                value={values.displayName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <FormErrorMessage>
                {touched.displayName && errors.displayName}
              </FormErrorMessage>
            </FormControl>
            <FormControl
              isRequired
              isInvalid={!!touched.designation && !!errors.designation}
              mb={3}
            >
              <FormLabel>Designation</FormLabel>
              <Input
                name="designation"
                value={values.designation}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <FormErrorMessage>
                {touched.designation && errors.designation}
              </FormErrorMessage>
            </FormControl>
            <FormControl
              isRequired
              isInvalid={!!touched.department && !!errors.department}
              mb={3}
            >
              <FormLabel>Department</FormLabel>
              <Select
                placeholder="Select Your department"
                name="department"
                value={values.department}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                {departments.map((department, i) => (
                  <option key={`deparment-option-${i}`} value={department}>
                    {department}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>
                {touched.department && errors.department}
              </FormErrorMessage>
            </FormControl>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} gap={4}>
              <FormControl
                isRequired
                isInvalid={!!touched.dateOfBirth && !!errors.dateOfBirth}
                mb={3}
              >
                <FormLabel>Date of Birth</FormLabel>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={values.dateOfBirth?.toString()}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <FormHelperText>Only you can see this</FormHelperText>
                <FormErrorMessage>
                  {touched.dateOfBirth && errors.dateOfBirth}
                </FormErrorMessage>
              </FormControl>
              <FormControl
                isRequired
                isInvalid={!!touched.phoneNumber && !!errors.phoneNumber}
                mb={3}
              >
                <FormLabel>Phone Number</FormLabel>
                <Input
                  name="phoneNumber"
                  value={values.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <FormErrorMessage>
                  {touched.phoneNumber && errors.phoneNumber}
                </FormErrorMessage>
              </FormControl>
            </SimpleGrid>
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
