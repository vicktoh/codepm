import { Button, Flex, Heading, HStack, Text } from "@chakra-ui/react";
import React, { FC } from "react";
type DeleteDialogProps = {
  title?: string;
  description?: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const DeleteDialog: FC<DeleteDialogProps> = ({
  title,
  description,
  isLoading,
  onClose,
  onConfirm,
}) => {
  return (
    <Flex direction="column" py={5} px={3}>
      <Heading fontSize="md">{title || "Are you sure"}</Heading>
      {description ? <Text mt={5}>{description}</Text> : null}
      <HStack spacing={6} direction="row" mt={5}>
        <Button onClick={onClose} variant="outline" colorScheme="brand">
          No
        </Button>
        <Button colorScheme="brand" onClick={onConfirm} isLoading={isLoading}>
          Yes
        </Button>
      </HStack>
    </Flex>
  );
};
