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
import React, { FC, useMemo } from "react";
import { BASE_URL } from "../../constants";
import { useAppSelector } from "../../reducers/types";
import { sendNotification } from "../../services/notificationServices";
import { updateRequisition } from "../../services/requisitionServices";
import { sendEmailNotification } from "../../services/userServices";
import { EmailPayLoad, Notification } from "../../types/Notification";
import { UserRole } from "../../types/Profile";
import { Project } from "../../types/Project";
import { Requisition, RequisitionStatus } from "../../types/Requisition";
import { UserReference } from "../../types/User";
import { CheckedBy, RequisitionField } from "./RequisitionAdminForm";
import { RequisitionAttachmentForm } from "./RequisitionAttachementForm";
import { RequisitionBeneficiaryTable } from "./RequisitionBeneficiaryTable";
import { RequisitionItemTable } from "./RequisitionItemTable";
type RequisitionViewProps = {
  requisition: Requisition;
  onClose: () => void;
};

export const RequisitionView: FC<RequisitionViewProps> = ({
  requisition,
  onClose,
}) => {
  const { users, auth, profile, projects } = useAppSelector(
    ({ users, auth, profile, projects }) => ({
      users,
      auth,
      profile,
      projects,
    }),
  );
  const { usersMap = {} } = users || {};
  const projectsMap = useMemo(() => {
    const projectMap: Record<string, Project> = {};
    projects?.forEach((project) => {
      projectMap[project.id] = project;
    });
    return projectMap;
  }, [projects]);
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
    activityTitle,
  } = requisition;
  const isMobile = useBreakpointValue({ base: true, md: false, lg: true });
  const date = format(requisition.timestamp, "dd MMM Y");
  const toast = useToast();

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
            value={
              projectsMap[requisition.projectId].title || projectTitle || "N/A"
            }
          />
        </GridItem>
        <GridItem colSpan={1}>
          <RequisitionField label="Acitivity " value={activityTitle || "N/A"} />
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
      <SimpleGrid columns={[1, 3]} mt={5} mb={3} gap={5}>
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
    </Flex>
  );
};
