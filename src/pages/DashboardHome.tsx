import { Flex, Heading, Text } from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
import { DashboardProjects } from "../components/DashboardProjects";
import { MyTasks } from "../components/MyTasks";

export const DashboardHome = () => {
  return (
    <Flex direction="column" px={5}>
      <Flex direction="row" justifyContent="space-between">
        <Heading fontSize="lg">Projects</Heading>
        <Text
          as={Link}
          to="/dashboard/projects"
          textDecor="underline"
          color="red.500"
        >
          See All
        </Text>
      </Flex>
      <DashboardProjects />
      <MyTasks />
    </Flex>
  );
};
