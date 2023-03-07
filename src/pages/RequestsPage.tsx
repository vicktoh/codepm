import { Flex, Heading } from "@chakra-ui/react";
import React from "react";
import RequestView from "../components/RequestView";

export const RequestsPage = () => {
  return (
    <Flex direction="column">
      <Heading fontSize="lg" my={2}>
        Leave and log requests
      </Heading>
      <RequestView />
    </Flex>
  );
};
