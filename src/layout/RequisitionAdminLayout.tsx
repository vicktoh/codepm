import { Flex, Heading, HStack, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { BsBarChartLine, BsListOl } from "react-icons/bs";
import { Link, Outlet, useMatch } from "react-router-dom";
import { useGlassEffect } from "../hooks/useLoadingAnimation";

export const RequisitionAdminLayout = () => {
  const glassEffect = useGlassEffect(true, "lg");
  const isRequisitionPage = !!useMatch("/requisition-admin");
  const isAnalyticsPage = !!useMatch("/requisition-admin/analytics");
  return (
    <Flex position="relative" direction="column" width="100%" flex="1 1">
      <Heading my={[2, 5]} fontSize="xl">
        Requisition Admin
      </Heading>
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
          to="/requisition-admin"
          textColor={isRequisitionPage ? "brand.300" : ""}
        >
          <Icon as={BsListOl} />
          <Text color={isRequisitionPage ? "brand.300" : ""}>Requisitions</Text>
        </HStack>
        <HStack
          ml={5}
          as={Link}
          to="/requisition-admin/analytics"
          textColor={isAnalyticsPage ? "brand.300" : ""}
        >
          <Icon as={BsBarChartLine} />
          <Text color={isAnalyticsPage ? "brand.300" : ""}>Analytics</Text>
        </HStack>
      </Flex>
      <Flex height="100%" direction="column" flex="1 1" overflowY="auto">
        <Outlet />
      </Flex>
    </Flex>
  );
};
