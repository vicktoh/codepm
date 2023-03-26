import { Flex, Heading, HStack, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { BiArchive, BiCar } from "react-icons/bi";
import { BsListOl } from "react-icons/bs";
import { Link, Outlet, useMatch } from "react-router-dom";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { useAppSelector } from "../reducers/types";
import { UserRole } from "../types/Profile";

export const RequestAdminLayout = () => {
  const glassEffect = useGlassEffect(true, "lg");
  const auth = useAppSelector(({ auth }) => auth);
  const isAccessPage = !!useMatch("/requests-admin");
  const isLogPage = !!useMatch("/requests-admin/vehicle");
  return (
    <Flex
      position="relative"
      direction="column"
      flex="1 1"
      width="100%"
      height="100%"
    >
      <Heading my={[2, 5]}>Requests</Heading>
      <Flex
        position={["relative", "absolute"]}
        top={[0, 5]}
        right={[0, 5]}
        direction="row"
        my={[3, 0]}
        px={5}
        py={3}
        width="max-content"
        bg="white"
        borderRadius="md"
      >
        {auth?.role === UserRole.admin || auth?.role === UserRole.master ? (
          <HStack
            as={Link}
            to="/requests-admin"
            textColor={isAccessPage ? "brand.300" : ""}
          >
            <Icon as={BiArchive} />
            <Text color={isAccessPage ? "brand.300" : ""}>Requests</Text>
          </HStack>
        ) : null}
        <HStack
          ml={5}
          as={Link}
          to="/requests-admin/vehicle"
          textColor={isLogPage ? "brand.300" : ""}
        >
          <Icon as={BiCar} />
          <Text color={isLogPage ? "brand.300" : ""}>Vehicle Request</Text>
        </HStack>
      </Flex>
      <Flex height="100%" direction="column" flex="1 1" overflowY="auto">
        <Outlet />
      </Flex>
    </Flex>
  );
};
