import { Flex, Heading, HStack, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { BiArchive } from "react-icons/bi";
import { BsListOl } from "react-icons/bs";
import { Link, Outlet, useMatch } from "react-router-dom";
import { useGlassEffect } from "../hooks/useLoadingAnimation";

export const UsersLayout = () => {
  const glassEffect = useGlassEffect(true, "lg");
  const isAccessPage = !!useMatch("/users");
  const isLogPage = !!useMatch("/users/requests");
  return (
    <Flex
      position="relative"
      direction="column"
      flex="1 1"
      width="100%"
      height="100%"
    >
      <Heading my={[2, 5]}>Users</Heading>
      <Flex
        position={["relative", "absolute"]}
        top={[0, 5]}
        right={[0, 5]}
        direction="row"
        my={[3, 0]}
        px={5}
        py={3}
        {...glassEffect}
        width="max-content"
      >
        <HStack
          as={Link}
          to="/users"
          textColor={isAccessPage ? "brand.300" : ""}
        >
          <Icon as={BsListOl} />
          <Text color={isAccessPage ? "brand.300" : ""}>Users Access</Text>
        </HStack>
        <HStack
          ml={5}
          as={Link}
          to="/users/requests"
          textColor={isLogPage ? "brand.300" : ""}
        >
          <Icon as={BiArchive} />
          <Text color={isLogPage ? "brand.300" : ""}>Log Access</Text>
        </HStack>
      </Flex>
      <Flex height="100%" direction="column" flex="1 1" overflowY="auto">
        <Outlet />
      </Flex>
    </Flex>
  );
};
