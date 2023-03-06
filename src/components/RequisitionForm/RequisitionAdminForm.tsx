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
import { Timestamp } from "firebase/firestore";
import { Form, Formik } from "formik";
import React, { FC } from "react";
import { BASE_URL } from "../../constants";
import { useAppSelector } from "../../reducers/types";
import { sendNotification } from "../../services/notificationServices";
import { updateRequisition } from "../../services/requisitionServices";
import { sendEmailNotification } from "../../services/userServices";
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
            size="xs"
            src={usersMap[userId]?.photoUrl || photoUrl}
          />
          <VStack spacing={0} alignItems="flex-start">
            <Heading fontSize="sm">
              {usersMap[userId]?.displayName || displayName}
            </Heading>
            <Text fontSize="xs">{usersMap[userId]?.designation}</Text>
          </VStack>
        </HStack>
        <Text color="tetiary.200" fontSize="sm" fontWeight="bold">
          {title}
        </Text>
        {timestamp ? (
          <Text my={1} fontSize="xs" color="brand.400" fontWeight="bold">
            {format(timestamp, "dd MMM Y")}
          </Text>
        ) : null}
        <Image
          width="60px"
          height="30px"
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
              UserRole.admin,
              UserRole.master,
              UserRole.reviewer,
            ].includes(auth?.role)
          ) {
            toast({
              title: "You do not have authorization for this action",
              status: "error",
            });
            return;
          }
          if (
            auth?.role === UserRole.reviewer &&
            requisition.status === RequisitionStatus.pending
          ) {
            toast({
              title: "Budget holder must check this requisition first",
              status: "warning",
            });
          }
          if (
            auth?.role === UserRole.finance &&
            requisition.status === RequisitionStatus.pending
          ) {
            toast({
              title: "This requisition must be reviewed first",
              status: "warning",
            });
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
              ...(auth?.role === UserRole.reviewer
                ? {
                    reviewedBy: {
                      userId: auth?.uid || "",
                      photoUrl: profile?.photoUrl || "",
                      displayName: profile?.displayName || "",
                    },
                    reviewedById: auth?.uid || "",
                    reviewedTimestamp: new Date().getTime(),
                    status: RequisitionStatus.reviewed,
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
            const message = `Your requisition titled "${newRequisition.title}" has been checked by ${auth.displayName} as a ${auth.role}`;
            const today = format(new Date(), "do LLL Y");
            await updateRequisition(
              requisition.creatorId,
              requisition.id || "",
              newRequisition,
            );
            sendEmailNotification({
              to: `${newRequisition.creator.displayName} <${
                usersMap[requisition.creatorId]?.email
              }>`,
              data: {
                action: `${BASE_URL}`,
                date: today,
                message: message,
                title,
              },
            });
            sendNotification({
              read: false,
              reciepientId: newRequisition.creatorId,
              title,
              timestamp: Timestamp.now(),
              description: message,
              linkTo: "/requisitions",
              type: "requisition",
            });
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
            const message = `Your requisition titled "${newRequisition.title}" has been approved by ${auth.displayName} as a ${auth.role}`;
            const today = format(new Date(), "do LLL Y");
            sendEmailNotification({
              to: `${usersMap[requisition.creatorId]?.displayName || ""} <${
                usersMap[requisition.creatorId]?.email
              }>`,
              data: {
                action: `${BASE_URL}`,
                date: today,
                message: message,
                title,
              },
            });
            sendNotification({
              read: false,
              reciepientId: newRequisition.creatorId,
              title,
              timestamp: Timestamp.now(),
              description: message,
              linkTo: "/requisitions",
              type: "requisition",
            });
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
              {requisition.status !== RequisitionStatus.pending &&
              requisition.budgetHolderCheck ? (
                <CheckedBy
                  {...requisition.budgetHolderCheck}
                  timestamp={requisition.budgetHolderCheckedTimestamp}
                  title={"Budget Holder Check"}
                />
              ) : null}
              {requisition.reviewedBy ? (
                <CheckedBy
                  {...requisition.reviewedBy}
                  timestamp={requisition.reviewedTimestamp}
                  title={"Reviewed By"}
                />
              ) : null}
              {requisition.checkedby ? (
                <CheckedBy
                  {...requisition.checkedby}
                  timestamp={requisition.checkedTimeStamp}
                  title={"Finance Check"}
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
              [RequisitionStatus.pending].includes(requisition.status) ? (
                <Button
                  variant="solid"
                  colorScheme="green"
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
              {auth?.role === UserRole.reviewer &&
              requisition.status !== RequisitionStatus.reviewed &&
              requisition.status !== RequisitionStatus.approved &&
              requisition.status !== RequisitionStatus.checked ? (
                <Button
                  colorScheme="purple"
                  variant="solid"
                  size={isMobile ? "sm" : "lg"}
                  isLoading={values.mode === "check" && isSubmitting}
                  onClick={() => {
                    setFieldValue("mode", "check");
                    submitForm();
                  }}
                >
                  Mark as reviewed
                </Button>
              ) : null}
              {auth?.role === UserRole.finance &&
              requisition.status !== RequisitionStatus.approved &&
              requisition.status !== RequisitionStatus.checked ? (
                <Button
                  colorScheme="purple"
                  variant="solid"
                  size={isMobile ? "sm" : "lg"}
                  isLoading={values.mode === "check" && isSubmitting}
                  onClick={() => {
                    setFieldValue("mode", "check");
                    submitForm();
                  }}
                >
                  Finance Check
                </Button>
              ) : null}
              {requisition.status === RequisitionStatus.checked ? (
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
              ) : null}
            </HStack>
          </Form>
        )}
      </Formik>
    </Flex>
  );
};
