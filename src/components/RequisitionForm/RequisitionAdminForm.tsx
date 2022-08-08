import {
  Avatar,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Text,
  useBreakpointValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { Form, Formik } from "formik";
import React, { FC } from "react";
import { useAppSelector } from "../../reducers/types";
import { updateRequisition } from "../../services/requisitionServices";
import { UserRole } from "../../types/Profile";
import { Requisition, RequisitionStatus } from "../../types/Requisition";
import { RequisitionAttachmentForm } from "./RequisitionAttachementForm";
import { RequisitionItemTable } from "./RequisitionItemTable";
type RequisitionAdminFormProps = {
  requisition: Requisition;
  onClose: () => void;
};
type RequisitionFieldProps = {
  label: string;
  value: string;
};
const RequisitionField: FC<RequisitionFieldProps> = ({ label, value }) => {
  const isMobile = useBreakpointValue({ base: true, md: false, lg: true });
  return (
    <VStack alignItems="flex-start" spacing={0}>
      <Heading fontSize={isMobile ? "xs" : "sm"}>{label}</Heading>
      <Text>{value}</Text>
    </VStack>
  );
};
export const RequisitionAdminForm: FC<RequisitionAdminFormProps> = ({
  requisition,
  onClose,
}) => {
  const { users, auth, profile } = useAppSelector(
    ({ users, auth, profile }) => ({
      users,
      auth,
      profile,
    }),
  );
  const { usersMap = {} } = users || {};
  const {
    title,
    currency,
    creatorId,
    items = [],
    type,
    beneficiaryAccountNumber,
    beneficiaryBank,
    projectTitle,
    total,
    amountInWords,
    acitivityTitle,
    beneficiaryName,
  } = requisition;
  const isMobile = useBreakpointValue({ base: true, md: false, lg: true });
  const date = format(requisition.timestamp, "dd MMM Y");
  const toast = useToast();
  const initialValues: {
    attachments: Requisition["attachments"];
    mode: "check" | "approve" | "send-back";
  } = {
    attachments: requisition?.attachments || [],
    mode: "check",
  };
  return (
    <Flex px={5} py={5} direction="column">
      <HStack my={3} alignItems="center">
        <Avatar
          size="md"
          src={usersMap[creatorId]?.photoUrl}
          name={usersMap[creatorId]?.displayName}
        />
        <Heading fontSize="dm">{usersMap[creatorId]?.displayName}</Heading>
      </HStack>
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(3,1fr)",
        }}
        my={5}
        columnGap={5}
        rowGap={5}
      >
        <GridItem w="100" colSpan={[1, 3]}>
          <RequisitionField label="Title" value={title} />
        </GridItem>
        <GridItem colSpan={1}>
          <RequisitionField label="Requisition Type" value={type} />
        </GridItem>
        <GridItem colSpan={1}>
          <RequisitionField label="Date" value={date} />
        </GridItem>
        <GridItem colSpan={1}>
          <RequisitionField
            label="Project Title"
            value={projectTitle || "N/A"}
          />
        </GridItem>
        <GridItem colSpan={1}>
          <RequisitionField
            label="Acitivity "
            value={acitivityTitle || "N/A"}
          />
        </GridItem>
        <GridItem colSpan={1}>
          <RequisitionField label="Beneficiary Name" value={beneficiaryName} />
        </GridItem>
        <GridItem colSpan={1}>
          <RequisitionField label="Beneficiary Bank" value={beneficiaryBank} />
        </GridItem>
        <GridItem colSpan={1}>
          <RequisitionField
            label="Beneficiary Account Number"
            value={beneficiaryAccountNumber}
          />
        </GridItem>
        <GridItem colSpan={1}>
          <RequisitionField
            label="Total"
            value={`${currency} ${total.toLocaleString()}`}
          />
        </GridItem>
        <GridItem colSpan={[1, 3]}>
          <RequisitionField label="Amount In Words" value={amountInWords} />
        </GridItem>
      </Grid>
      <RequisitionItemTable items={items} />
      <Formik
        initialValues={initialValues}
        onSubmit={async (values) => {
          if (
            !auth?.role ||
            ![
              UserRole.budgetHolder,
              UserRole.finance,
              UserRole.master,
            ].includes(auth?.role)
          ) {
            toast({
              title: "You do not have authorization for this action",
              status: "error",
            });
            return;
          }
          if (values.mode === "check") {
            const newRequisition: Requisition = {
              ...requisition,
              attachments: values.attachments || [],
              ...(auth?.role === UserRole.budgetHolder
                ? {
                    budgetHolderCheck: {
                      userId: auth?.uid || "",
                      photoUrl: profile?.photoUrl || "",
                      displayName: profile?.displayName || "",
                    },
                    budgetHolderId: auth?.uid || "",
                    budgetHolderCheckedTimestamp: new Date().getTime(),
                    status: RequisitionStatus.budgetholder,
                  }
                : null),
              ...(auth?.role === UserRole.finance
                ? {
                    checkedby: {
                      userId: auth.uid || "",
                      photoUrl: profile?.photoUrl || "",
                      displayName: profile?.displayName || "",
                    },
                    checkedById: auth?.uid || "",
                    checkedTimeStamp: new Date().getTime(),
                    status: RequisitionStatus.checked,
                  }
                : null),
            };
            await updateRequisition(
              requisition.creatorId,
              requisition.id || "",
              newRequisition,
            );
            onClose();
          }
          if (values.mode === "approve") {
            if (requisition.status !== RequisitionStatus.checked) {
              toast({
                title:
                  "Requisition needs to be checked by all parties before approval",
                status: "error",
              });
              return;
            }
            const newRequisition: Requisition = {
              ...requisition,
              attachments: values.attachments || [],
              approvedBy: {
                userId: auth?.uid || "",
                photoUrl: profile?.photoUrl || "",
                displayName: profile?.displayName || "",
              },
              approvedById: auth?.uid || "",
              approvedCheckedTimestamp: new Date().getTime(),
              status: RequisitionStatus.approved,
            };
            await updateRequisition(
              requisition.creatorId,
              requisition.id || "",
              newRequisition,
            );
            onClose();
          }
        }}
      >
        {({ values, isSubmitting, setFieldValue, submitForm }) => (
          <Form>
            <RequisitionAttachmentForm />
            <HStack spacing={3} my={3}>
              {auth?.role === UserRole.budgetHolder &&
              requisition.status !== RequisitionStatus.approved ? (
                <Button
                  variant="outline"
                  colorScheme="brand"
                  size={isMobile ? "sm" : "lg"}
                  onClick={() => {
                    setFieldValue("mode", "check");
                    submitForm();
                  }}
                >
                  Check as a BudgetHolder
                </Button>
              ) : null}
              {auth?.role === UserRole.finance &&
              requisition.status !== RequisitionStatus.approved ? (
                <Button
                  colorScheme="brand"
                  variant="outline"
                  size={isMobile ? "sm" : "lg"}
                  isLoading={isSubmitting}
                  onClick={() => {
                    setFieldValue("mode", "check");
                    submitForm();
                  }}
                >
                  Check as a Finance
                </Button>
              ) : null}
              {requisition.status === RequisitionStatus.approved ? null : (
                <Button
                  isLoading={isSubmitting}
                  onClick={() => {
                    setFieldValue("mode", "approve");
                    submitForm();
                  }}
                  colorScheme="brand"
                  size={isMobile ? "sm" : "lg"}
                >
                  Approve
                </Button>
              )}
            </HStack>
          </Form>
        )}
      </Formik>
    </Flex>
  );
};
