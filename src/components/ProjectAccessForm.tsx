import {
  Avatar,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  VStack,
  Tooltip,
  Button,
  useToast,
} from "@chakra-ui/react";
import React, { FC, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { useAppSelector } from "../reducers/types";
import { editProject } from "../services/projectServices";
import { Project } from "../types/Project";
import { EmptyState } from "./EmptyState";
import { UserListPopover } from "./UserListPopover";
type ProjectAccessFormProps = {
  project: Project;
  onUpdate: (project: Project) => void;
  onClose: () => void;
};
export const ProjectAccessForm: FC<ProjectAccessFormProps> = ({
  project,
  onUpdate,
  onClose,
}) => {
  const { users } = useAppSelector(({ users }) => ({ users }));
  const { usersMap = {} } = users || {};
  const { budgetAccess = [], writeAccess = [] } = project;
  const [budget, setBudget] = useState<string[]>(budgetAccess);
  const [write, setWrite] = useState<string[]>(writeAccess);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const onSelect = (type: "budget" | "write", userId: string) => {
    const data = [...(type === "budget" ? budget : write)];
    const index = data.findIndex((user) => user === userId);
    if (index > -1) {
      data.splice(index, 1);
    } else {
      data.push(userId);
    }
    type === "budget" ? setBudget(data) : setWrite(data);
  };
  const saveAccess = async () => {
    const data: Pick<Project, "budgetAccess" | "writeAccess" | "id"> = {
      budgetAccess: budget,
      writeAccess: write,
      id: project.id,
    };
    try {
      setSaving(true);
      await editProject(data);
      onUpdate({ ...project, ...data });
      onClose();
    } catch (error) {
      toast({ title: "Something went wront", status: "error" });
    } finally {
      setSaving(false);
    }
  };
  return (
    <Flex direction="column" p={3}>
      <VStack alignItems="flex-start" spacing={2}>
        <HStack>
          <Heading fontSize="md">🧮 Budget Access </Heading>
          <UserListPopover
            onSelectUser={(userId) => onSelect("budget", userId)}
            assignees={budget}
          >
            <IconButton
              icon={<Icon as={BiPlus} />}
              colorScheme="brand"
              aria-label="manage access"
              size="md"
              borderRadius="full"
            />
          </UserListPopover>
        </HStack>
        <HStack spacing={-2}>
          {budget.length ? (
            budget.map((userId) => (
              <Tooltip
                key={`access-${userId}`}
                title={usersMap[userId]?.displayName || "Unknown user"}
              >
                <Avatar
                  size="sm"
                  src={usersMap[userId]?.photoUrl || ""}
                  name={usersMap[userId]?.displayName || "Unknown user"}
                />
              </Tooltip>
            ))
          ) : (
            <EmptyState title="No Budget access granted yet!" />
          )}
        </HStack>
      </VStack>
      <VStack alignItems="flex-start" spacing={2}>
        <HStack>
          <Heading fontSize="md">✏️ Write Access </Heading>
          <UserListPopover
            onSelectUser={(userId) => onSelect("write", userId)}
            assignees={write}
          >
            <IconButton
              icon={<Icon as={BiPlus} />}
              colorScheme="brand"
              aria-label="manage access"
              size="md"
              borderRadius="full"
            />
          </UserListPopover>
        </HStack>
        <HStack spacing={-2}>
          {write.length ? (
            write.map((userId) => (
              <Tooltip
                key={`access-${userId}`}
                title={usersMap[userId]?.displayName || "Unknown user"}
              >
                <Avatar
                  size="sm"
                  src={usersMap[userId]?.photoUrl || ""}
                  name={usersMap[userId]?.displayName || "Unknown user"}
                />
              </Tooltip>
            ))
          ) : (
            <EmptyState title="No Write access granted yet!" />
          )}
        </HStack>
      </VStack>
      <Flex justifyContent="space-between" mt={5} alignItems="center">
        <Button
          onClick={onClose}
          size="md"
          variant="outline"
          colorScheme="brand"
        >
          Cancel
        </Button>
        <Button
          onClick={saveAccess}
          size="md"
          variant="solid"
          colorScheme="brand"
          isLoading={saving}
        >
          Save
        </Button>
      </Flex>
    </Flex>
  );
};
