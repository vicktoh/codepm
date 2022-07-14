import { Flex, Heading, Text } from "@chakra-ui/react";
import React, { FC } from "react";
type EmptyStateProps = {
  title?: string;
  description?: string;
};
export const EmptyState: FC<EmptyStateProps> = ({ title, description }) => {
  return (
    <Flex
      direction="column"
      flex="1 1"
      justifyContent="center"
      alignItems="center"
      maxHeight="5rem"
      px={5}
    >
      <Heading my={5} fontSize="sm">
        {title || "There is nothing to show here"}
      </Heading>
      {description ? <Text my={2}>{description}</Text> : null}
    </Flex>
  );
};
