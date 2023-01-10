import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  useToast,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { FC } from "react";
import { SystemFields } from "../constants";
import { useAppSelector } from "../reducers/types";
import { updateSystemVariable } from "../services/authServices";
import { System } from "../types/System";
type SystemFormProps = {
  onClose: () => void;
};
export const SystemForm: FC<SystemFormProps> = ({ onClose }) => {
  const system = useAppSelector(({ system }) => system);
  const toast = useToast();
  const initialValues: Omit<System, "publicHolidays"> = {
    casualLeaveDays: system?.casualLeaveDays || 0,
    paternityLeaveDays: system?.paternityLeaveDays || 0,
    maternityLeaveDays: system?.maternityLeaveDays || 0,
    leaveDays: system?.leaveDays || 0,
    certificationLeaveDays: system?.certificationLeaveDays || 0,
    sickLeaveDays: system?.sickLeaveDays || 0,
    compassionateLeaveDays: system?.compassionateLeaveDays || 0,
    leaveOfAbsence: system?.leaveOfAbsence || 0,
    studyLeaveDays: system?.studyLeaveDays || 0,
    logStartDate: system?.logStartDate || "",
    logAllowanceDay: system?.logAllowanceDay || 0,
    studyLeaveWithoutPayDays: system?.studyLeaveWithoutPayDays || 0,
    meditationLeaveDays: system?.meditationLeaveDays || 0,
  };
  return (
    <Flex direction="column" px={5} pt={5}>
      <Heading fontSize="lg" my={2}>
        Edit System Variables
      </Heading>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values) => {
          console.log(values);
          try {
            updateSystemVariable(values);
            onClose();
          } catch (error) {
            console.log(error);
            toast({
              title: "Could not update system varialbes",
              status: "error",
            });
          }
        }}
      >
        {({ values, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <FormControl mb={5}>
              <FormLabel>{SystemFields["casualLeaveDays"]}</FormLabel>
              <Input
                value={values.casualLeaveDays}
                name="casualLeaveDays"
                type="number"
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormControl mb={5}>
              <FormLabel>{SystemFields["compassionateLeaveDays"]}</FormLabel>
              <Input
                value={values.compassionateLeaveDays}
                name="compassionateLeaveDays"
                type="number"
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormControl mb={5}>
              <FormLabel>{SystemFields["studyLeaveDays"]}</FormLabel>
              <Input
                value={values.studyLeaveDays}
                name="studyLeaveDays"
                type="number"
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormControl mb={5}>
              <FormLabel>{SystemFields["studyLeaveWithoutPayDays"]}</FormLabel>
              <Input
                value={values.studyLeaveWithoutPayDays}
                name="studyLeaveWithoutPayDays"
                type="number"
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormControl mb={5}>
              <FormLabel>{SystemFields["meditationLeaveDays"]}</FormLabel>
              <Input
                value={values.meditationLeaveDays}
                name="meditationLeaveDays"
                type="number"
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormControl mb={5}>
              <FormLabel>{SystemFields["certificationLeaveDays"]}</FormLabel>
              <Input
                value={values.certificationLeaveDays}
                name="certificationLeaveDays"
                type="number"
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormControl mb={5}>
              <FormLabel>{SystemFields["leaveDays"]}</FormLabel>
              <Input
                value={values.leaveDays}
                name="leaveDays"
                type="number"
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormControl mb={5}>
              <FormLabel>{SystemFields["paternityLeaveDays"]}</FormLabel>
              <Input
                value={values.paternityLeaveDays}
                name="paternityLeaveDays"
                type="number"
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormControl mb={5}>
              <FormLabel>{SystemFields["maternityLeaveDays"]}</FormLabel>
              <Input
                value={values.maternityLeaveDays}
                type="number"
                name="maternityLeaveDays"
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormControl mb={5}>
              <FormLabel>{SystemFields["logAllowanceDay"]}</FormLabel>
              <Input
                value={values.logAllowanceDay}
                type="number"
                name="logAllowanceDay"
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormControl mb={5}>
              <FormLabel>{SystemFields["logStartDate"]}</FormLabel>
              <Input
                value={values.logStartDate}
                name="logStartDate"
                type="date"
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>

            <Flex direction="row" justifyContent="space-between">
              <Button onClick={onClose} variant="outline" colorScheme="brand">
                Cancel
              </Button>
              <Button
                isLoading={isSubmitting}
                variant="solid"
                colorScheme="brand"
                type="submit"
              >
                Save
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Flex>
  );
};
