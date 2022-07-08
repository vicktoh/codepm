import {
  Box,
  Flex,
  HStack,
  IconButton,
  Text,
  Tooltip,
  Icon,
} from "@chakra-ui/react";
import React, { FC } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { BsTrash } from "react-icons/bs";
import { FiChevronsRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { WORKPLAN_COLORS } from "../constants";
import { ProjectWorkPlan } from "../types/Project";

type WorkplanRowProps = {
  workplan: ProjectWorkPlan;
  projectId: string;
  onEditWorkPlan: () => void;
  onDeleteWorkPlan: () => void;
};

export const WorkplanRow: FC<WorkplanRowProps> = ({
  workplan: { title, type, id },
  projectId,
  onEditWorkPlan,
  onDeleteWorkPlan,
}) => {
  return (
    <Flex
      direction={["column", "row"]}
      bg="white"
      borderRadius="lg"
      justifyContent="space-between"
      py={3}
      px={3}
      my={2}
    >
      <HStack spacing={5} alignItems="center">
        <HStack>
          <Box
            width={3}
            height={3}
            borderRadius={3}
            bgColor={WORKPLAN_COLORS[type]}
          />
          <Text>{title}</Text>
        </HStack>
        <Text>{type}</Text>
      </HStack>
      <HStack mt={[3, 0]} spacing={[8, 3]}>
        <Tooltip label="Edit Workplan">
          <IconButton
            aria-label="edit icon"
            icon={<Icon as={AiOutlineEdit} />}
            size="sm"
            color="blue.400"
            onClick={onEditWorkPlan}
          />
        </Tooltip>
        <Tooltip label="Delete Workplan">
          <IconButton
            aria-label="delete icon"
            icon={<Icon as={BsTrash} />}
            size="sm"
            color="red.300"
            onClick={onDeleteWorkPlan}
          />
        </Tooltip>
        <Tooltip label="View Tasks">
          <IconButton
            as={Link}
            to={`${id}`}
            aria-label="more icon"
            icon={<Icon as={FiChevronsRight} />}
            size="sm"
          />
        </Tooltip>
      </HStack>
    </Flex>
  );
};
