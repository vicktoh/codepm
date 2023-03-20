import { Flex, Heading, HStack, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { BiArchive } from "react-icons/bi";
import { BsListOl } from "react-icons/bs";
import { Link, Outlet, useMatch } from "react-router-dom";
import { useGlassEffect } from "../hooks/useLoadingAnimation";

export const RequisitionLayout = () => {
  const isRequisitionPage = !!useMatch("/requisitions");
  const isArchivePage = !!useMatch("/requisitions/archive");
  return (
    <Flex position="relative" direction="column" width="100%" flex="1 1">
      <Heading my={[2, 5]}>Requisitions</Heading>
      <Flex
        position={["relative", "absolute"]}
        top={[0, 5]}
        right={[0, 5]}
        direction="row"
        my={[3, 0]}
        px={5}
        py={3}
        background="whiteAlpha.200"
        width="max-content"
      >
        <HStack
          as={Link}
          to="/requisitions"
          textColor={isRequisitionPage ? "brand.300" : ""}
        >
          <Icon as={BsListOl} />
          <Text color={isRequisitionPage ? "brand.300" : ""}>Requisitions</Text>
        </HStack>
        <HStack
          ml={5}
          as={Link}
          to="/requisitions/archive"
          textColor={isArchivePage ? "brand.300" : ""}
        >
          <Icon as={BiArchive} />
          <Text color={isArchivePage ? "brand.300" : ""}>Archive</Text>
        </HStack>
      </Flex>
      <Flex height="100%" direction="column" flex="1 1" overflowY="auto">
        <Outlet />
      </Flex>
    </Flex>
  );
};
