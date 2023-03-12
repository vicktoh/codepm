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
    <Flex direction="column" py={3} px={3}>
      <Heading fontSize="md" textAlign="center">
        {title || "Are you sure"}
      </Heading>
      {description ? <Text mt={5}>{description}</Text> : null}
      <Flex
        gap={3}
        alignItems="center"
        justifyContent="space-between"
        direction="row"
        mt={5}
      >
        <Button
          width="100%"
          onClick={onClose}
          variant="outline"
          colorScheme="brand"
        >
          No
        </Button>
        <Button
          width="100%"
          colorScheme="brand"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          Yes
        </Button>
      </Flex>
    </Flex>
  );
};
