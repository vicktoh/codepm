import { Box, Flex, Progress, Text } from "@chakra-ui/react";
import React, { FC } from "react";

type LoadingComponentType = {
  title?: string;
};

export const LoadingComponent: FC<LoadingComponentType> = ({
  title = "Loading ...",
}) => {
  return (
    <Flex
      direction="column"
      flex="1 1"
      justifyContent="center"
      alignItems="center"
    >
      <Box>
        <Progress />
        <Text>{title}</Text>
      </Box>
    </Flex>
  );
};
