import { Flex, Heading, HStack, Text } from "@chakra-ui/react";
import React, { FC } from "react";
import { Link, Outlet, useMatch } from "react-router-dom";
import { useGlassEffect } from "../hooks/useLoadingAnimation";

export const Dashboard: FC = () => {
  const date = new Date();
  const glassEffect = useGlassEffect(true);
  return (
    <Flex width="100%" direction="column" p={[2, 5]}>
      <Heading fontSize="md">{date.toDateString()}</Heading>
      <Flex direction="column" my={3}>
        <HStack
          spacing={[2, 4]}
          alignSelf={["center", "flex-end"]}
          alignItems="center"
          px={[2, 5]}
          py={[1, 3]}
          {...glassEffect}
        >
          <Text
            fontSize={["sm", "md"]}
            as={Link}
            to="/dashboard"
            textDecor="underline"
            color={!!useMatch("/dashboard") ? "brand.300" : "tetiary.500"}
          >
            Dashboard
          </Text>
          <Text
            fontSize={["sm", "md"]}
            as={Link}
            to="/dashboard/projects"
            textDecor="underline"
            color={
              !!useMatch("/dashboard/projects") ? "brand.300" : "tetiary.500"
            }
          >
            Projects
          </Text>
          <Text
            fontSize={["sm", "md"]}
            as={Link}
            to="/dashboard/proposals"
            textDecor="underline"
            color={
              !!useMatch("/dashboard/proposals") ? "brand.300" : "tetiary.500"
            }
          >
            Proposals
          </Text>
          <Text
            fontSize={["sm", "md"]}
            as={Link}
            to="/dashboard/media"
            textDecor="underline"
            color={!!useMatch("/dashboard/media") ? "brand.300" : "tetiary.500"}
          >
            Media Campaigns
          </Text>
        </HStack>
      </Flex>
      <Outlet />
    </Flex>
  );
};
