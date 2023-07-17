import { Flex, Heading, HStack, IconButton } from "@chakra-ui/react";
import React from "react";
import { BiArchive } from "react-icons/bi";
import { BsBack, BsListOl } from "react-icons/bs";
import { MdOutlineArrowBack } from "react-icons/md";
import { Link, Outlet, useMatch } from "react-router-dom";
import { useGlassEffect } from "../hooks/useLoadingAnimation";

export const UsersLayout = () => {
  const glassEffect = useGlassEffect(true, "lg");
  const isAccessPage = !!useMatch("/users");
  const isAttendancePage = !!useMatch("/users/attendance");
  return (
    <Flex
      position="relative"
      direction="column"
      flex="1 1"
      width="100%"
      height="100%"
    >
      <Flex
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        pr={5}
      >
        <HStack alignItems="center">
          {!isAccessPage ? (
            <IconButton
              aria-label="back button"
              icon={<MdOutlineArrowBack />}
              onClick={() => window.history.back()}
            />
          ) : null}
          <Heading my={[2, 5]} px={5}>
            {isAccessPage ? "Users" : "Attendance"}
          </Heading>
        </HStack>
        {/* {!isAttendancePage ? (
          <Flex
            direction="row"
            alignItems="center"
            px={2}
            py={2}
            border={1}
            borderRadius="lg"
            height="max-content"
            bg="whiteAlpha.400"
          >
            <Text
              size="sm"
              as={Link}
              to="attendance"
              color="brand"
              fontWeight="bold"
            >
              General Attendance
            </Text>
          </Flex>
        ) : null} */}
      </Flex>
      <Flex height="100%" direction="column" flex="1 1">
        <Outlet />
      </Flex>
    </Flex>
  );
};
