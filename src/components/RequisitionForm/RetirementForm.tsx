import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Textarea,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { FC } from "react";
import * as yup from "yup";
import { Requisition, RequisitionStatus } from "../../types/Requisition";
import { RequisitionAttachmentForm } from "./RequisitionAttachementForm";
import { CheckedBy } from "./RequisitionAdminForm";
import { updateRetirementStatus } from "../../services/requisitionServices";
import { useAppSelector } from "../../reducers/types";
type RetirementFormProps = {
  requisition: Requisition;
  mode?: "retire" | "approve";
  onClose: () => void;
};
export const RetirementForm: FC<RetirementFormProps> = ({
  requisition,
  mode = "retire",
  onClose,
}) => {
  const toast = useToast();
  const { auth, profile } = useAppSelector(({ auth, profile }) => ({
    auth,
    profile,
  }));
  const retirementInitialValues: Pick<
    Requisition,
    "attachments" | "retirementComment" | "retirementRefund"
  > = {
    attachments: requisition.attachments || [],
    retirementComment: requisition.retirementComment || "",
  };
  const validationSchema = yup.object().shape({
    attachments: yup
      .array()
      .min(1, "You have to add at least one document to retire"),
  });

  return (
    <Formik
      initialValues={retirementInitialValues}
      onSubmit={async (values) => {
        if (!auth?.uid || !requisition.id) return;
        console.log({ mode });
        const retirementObject: Pick<
          Requisition,
          | "retirementApproveDate"
          | "retirementTimestamp"
          | "retirementApproved"
          | "status"
        > =
          mode === "approve"
            ? {
                retirementApproveDate: new Date().getTime(),
                retirementApproved: {
                  userId: auth.uid,
                  displayName: profile?.displayName || "",
                  photoUrl: profile?.photoUrl || "",
                  signatureUrl: profile?.signatureUrl || "",
                },
                status: RequisitionStatus["retirement-approved"],
              }
            : {
                status: RequisitionStatus.retired,
                retirementTimestamp: new Date().getTime(),
              };
        console.log({ retirementObject });
        try {
          await updateRetirementStatus(requisition.creatorId, requisition.id, {
            ...values,
            ...retirementObject,
          });
          toast({
            title: "Retirement Updated",
            status: "success",
          });
          onClose();
        } catch (error) {
          const err: any = error;
          console.log(error);
          toast({
            title: "Could not update retirement",
            description: err?.message || "Unkwnown Error",
            status: "error",
          });
        }
      }}
      validationSchema={validationSchema}
    >
      {({ values, handleChange, handleBlur, isSubmitting, touched }) => (
        <Form>
          <Heading fontSize="lg">Requisition Items</Heading>
          <Table mb={5}>
            <Thead>
              <Tr>
                <Td>Item</Td>
                <Td>Amount</Td>
              </Tr>
            </Thead>
            <Tbody>
              {requisition.items.length ? (
                requisition.items.map((item, i) => (
                  <Tr key={`item-${i}`}>
                    <Td>{item.title}</Td>
                    <Td>
                      {requisition.currency}
                      {item.amount.toLocaleString()}
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={2}>No Items found in this requisition</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
          <RequisitionAttachmentForm />
          <SimpleGrid gridColumnGap={[0, 3]} my={5} columns={[1, 2]}>
            <FormControl mb={[3, 0]}>
              <FormLabel>Remarks</FormLabel>
              <Textarea
                readOnly={mode === "approve"}
                name="retirementComment"
                value={values.retirementComment}
                onChange={handleChange}
                onBlur={handleBlur}
              ></Textarea>
            </FormControl>
            <FormControl>
              <FormLabel>Refund Amount</FormLabel>
              <Input
                readOnly={mode === "approve"}
                type="number"
                value={values.retirementRefund}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>
          </SimpleGrid>

          <HStack my={3}>
            {[
              RequisitionStatus.retired,
              RequisitionStatus.approved,
              RequisitionStatus.paid,
            ].includes(requisition.status) ? (
              <Button
                colorScheme="brand"
                type="submit"
                isLoading={isSubmitting}
              >
                {mode === "approve"
                  ? "Approve Retirement"
                  : "Submit Retirement"}
              </Button>
            ) : null}
          </HStack>
          {requisition.status === RequisitionStatus["retirement-approved"] &&
          requisition.retirementApproved ? (
            <CheckedBy
              {...requisition.retirementApproved}
              title={"Retirement Approved By"}
            />
          ) : null}
        </Form>
      )}
    </Formik>
  );
};
