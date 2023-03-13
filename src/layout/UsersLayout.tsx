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
      <Flex height="100%" direction="column" flex="1 1">
        <Outlet />
      </Flex>
    </Flex>
  );
};
