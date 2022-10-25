import {
  Avatar,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  SimpleGrid,
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
import { UserReference } from "../../types/User";
import { RequisitionAttachmentForm } from "./RequisitionAttachementForm";
import { RequisitionBeneficiaryTable } from "./RequisitionBeneficiaryTable";
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
export const CheckedBy: FC<
  UserReference & { timestamp?: number; title: string }
> = ({ userId, signatureUrl, photoUrl, title, displayName, timestamp }) => {
  const { users } = useAppSelector(({ users }) => ({ users }));
  const { usersMap = {} } = users || {};
  return (
    <Flex direction="column">
      <VStack alignItems="flex-start">
        <HStack spacing={3}>
          <Avatar
            name={usersMap[userId]?.displayName || displayName}
            size="sm"
            src={usersMap[userId]?.photoUrl || photoUrl}
          />
          <VStack spacing={0} alignItems="flex-start">
            <Heading fontSize="md">
              {usersMap[userId]?.displayName || displayName}
            </Heading>
            <Text>{usersMap[userId]?.designation}</Text>
          </VStack>
        </HStack>
        <Text color="tetiary.200" fontSize="md" fontWeight="bold">
          {title}
        </Text>
        {timestamp ? (
          <Text my={1} fontSize="sm" color="brand.400" fontWeight="bold">
            {format(timestamp, "dd MMM Y")}
          </Text>
        ) : null}
        <Image
          width="80px"
          height="50px"
          src={usersMap[userId]?.signatureUrl || signatureUrl}
          alt="Signature"
        />
      </VStack>
    </Flex>
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
    beneficiaries = [],
    projectTitle,
    total,
    amountInWords,
    acitivityTitle,
  } = requisition;
  const isMobile = useBreakpointValue({ base: true, md: false, lg: true });
  const date = format(requisition.timestamp, "dd MMM Y");
  const toast = useToast();
  const initialValues: {
    attachments: Requisition["attachments"];
    mode: "check" | "approve" | "send-back";
    budgetIds: string[];
  } = {
    attachments: requisition?.attachments || [],
    mode: "check",
    budgetIds: [],
  };

  return (
    <Flex px={5} py={5} direction="column">
      <HStack my={3} alignItems="center">
        <Avatar
          size="md"
          src={usersMap[creatorId]?.photoUrl}
          name={usersMap[creatorId]?.displayName}
        />
        <Heading fontSize="md">{usersMap[creatorId]?.displayName}</Heading>
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
          <RequisitionField
            label="Total"
            value={`${currency} ${total.toLocaleString()}`}
          />
        </GridItem>
        <GridItem colSpan={[1, 3]}>
          <RequisitionField label="Amount In Words" value={amountInWords} />
        </GridItem>
      </Grid>
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
              budgetIds: values.budgetIds,
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
            <RequisitionItemTable
              projectId={requisition.projectId}
              items={items}
            />
            <RequisitionBeneficiaryTable beneficiaries={beneficiaries} />
            <RequisitionAttachmentForm />
            <SimpleGrid columns={[1, 3]} mt={5} mb={3}>
              {requisition.budgetHolderCheck ? (
                <CheckedBy
                  {...requisition.budgetHolderCheck}
                  timestamp={requisition.budgetHolderCheckedTimestamp}
                  title={"Budget Holder Check"}
                />
              ) : null}
              {requisition.checkedby ? (
                <CheckedBy
                  {...requisition.checkedby}
                  timestamp={requisition.checkedTimeStamp}
                  title={"Finance Checked"}
                />
              ) : null}
              {requisition.approvedBy ? (
                <CheckedBy
                  {...requisition.approvedBy}
                  timestamp={requisition.approvedCheckedTimestamp}
                  title={"Approved By"}
                />
              ) : null}
            </SimpleGrid>
            <HStack spacing={3} my={3}>
              {auth?.role === UserRole.budgetHolder &&
              ![
                RequisitionStatus.approved,
                RequisitionStatus.budgetholder,
              ].includes(requisition.status) &&
              !requisition.budgetHolderCheck ? (
                <Button
                  variant="outline"
                  colorScheme="brand"
                  isLoading={values.mode === "check" && isSubmitting}
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
              requisition.status !== RequisitionStatus.approved &&
              requisition.status !== RequisitionStatus.checked ? (
                <Button
                  colorScheme="brand"
                  variant="outline"
                  size={isMobile ? "sm" : "lg"}
                  isLoading={values.mode === "check" && isSubmitting}
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
                  isLoading={values.mode === "approve" && isSubmitting}
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