import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { FC, useMemo } from "react";
import { Link, useMatch } from "react-router-dom";
import { Auth } from "../types/Auth";
import {
  AiOutlineCheckSquare,
  AiOutlineDashboard,
  AiOutlineRead,
} from "react-icons/ai";
import { BsBuilding, BsChat, BsCurrencyDollar, BsPower } from "react-icons/bs";
import { useLogout } from "../hooks/useLoadingAnimation";
import { FaUsersCog } from "react-icons/fa";
import { UserRole } from "../types/Profile";
import { GiTakeMyMoney } from "react-icons/gi";
import { useAppSelector } from "../reducers/types";
import { BiCar, BiCog } from "react-icons/bi";

type SideNavProps = {
  auth: Auth;
};

export const SideNav: FC<SideNavProps> = ({
  auth: { displayName, photoUrl, role },
}) => {
  const onLogout = useLogout();
  const { conversations, auth } = useAppSelector(({ conversations, auth }) => ({
    conversations,
    auth,
  }));
  const isUsersPath = !!useMatch("/users");
  const isDashboardpath = !!useMatch("/dashboard");
  const isHomePath = !!useMatch("/");
  const isAdminReqPath = !!useMatch("/requisition-admin");
  const isSettingPath = !!useMatch("/system-settings");
  const isRequestsPath = !!useMatch("/requests");
  const isVehiclePath = !!useMatch("/vehicle");
  const isRequestsAdminPath = !!useMatch("/requests-admin");
  const unreadMessages = useMemo(() => {
    let count = 0;
    (conversations || []).forEach((conversation) => {
      const number = Math.max(
        (conversation.chatCount || 0) -
          (conversation.conversation
            ? conversation.conversation[auth?.uid || 0] || 0
            : 0),
        0,
      );
      count += number;
    });
    return count > 9 ? "9+" : count;
  }, [conversations, auth?.uid]);
  return (
    <Flex
      display={{ base: "none", md: "none", lg: "flex" }}
      background="rgba(255, 255, 255, .32)"
      direction="column"
      width="16rem"
      borderRadius="2xl"
      px={6}
      height="98vh"
      position="fixed"
      top="0"
      zIndex={1}
      py={5}
    >
      <Heading fontSize="xl" my={3} alignSelf="center">
        CODE
      </Heading>
      <VStack>
        <Avatar
          as={Link}
          to="/profile"
          name={displayName}
          src={photoUrl}
          size="lg"
        />
        <Text fontWeight="bold">{displayName}</Text>
      </VStack>
      <VStack alignItems="flex-start" alignSelf="center" mt={8} spacing={6}>
        <HStack
          as={Link}
          to="/"
          spacing={2}
          color={isHomePath || isDashboardpath ? "brand.400" : "tetiary"}
        >
          <Icon as={AiOutlineDashboard} />
          <Text
            color={isHomePath || isDashboardpath ? "brand.400" : "tetiary"}
            fontWeight={isHomePath || isDashboardpath ? "extrabold" : "medium"}
          >
            Dashboard
          </Text>
        </HStack>
        <Box position="relative">
          <HStack
            as={Link}
            to="/chat"
            spacing={2}
            color={!!useMatch("/chat") ? "brand.400" : "tetiary"}
          >
            <Icon as={BsChat} />
            <Text
              color={!!useMatch("/chat") ? "brand.400" : "tetiary"}
              fontWeight={!!useMatch("/chat") ? "extrabold" : "medium"}
            >
              Chats
            </Text>
          </HStack>
          {unreadMessages ? (
            <Badge
              position="absolute"
              top="-5px"
              left="-9px"
              borderRadius="full"
              bg="brand.500"
              color="white"
            >
              {unreadMessages}
            </Badge>
          ) : null}
        </Box>
        <HStack
          as={Link}
          to="/logs"
          spacing={2}
          color={!!useMatch("/logs") ? "brand.400" : "tetiary"}
        >
          <Icon as={AiOutlineCheckSquare} />
          <Text
            color={!!useMatch("/logs") ? "brand.400" : "tetiary"}
            fontWeight={!!useMatch("/logs") ? "extrabold" : "medium"}
          >
            Logs
          </Text>
        </HStack>
        <HStack
          as={Link}
          to="/requests"
          spacing={2}
          color={!!useMatch("/requests") ? "brand.400" : "tetiary"}
        >
          <Icon as={AiOutlineRead} />
          <Text
            color={!!useMatch("/requests") ? "brand.400" : "tetiary"}
            fontWeight={!!useMatch("/requests") ? "extrabold" : "medium"}
          >
            Requests
          </Text>
        </HStack>
        <HStack
          as={Link}
          to="/requisitions"
          spacing={2}
          color={!!useMatch("/requisitions") ? "brand.400" : "tetiary"}
        >
          <Icon as={BsCurrencyDollar} />
          <Text
            color={!!useMatch("/requisitions") ? "brand.400" : "tetiary"}
            fontWeight={!!useMatch("/requisitions") ? "extrabold" : "medium"}
          >
            Requisition
          </Text>
        </HStack>
        {role === UserRole.admin || role === UserRole.master ? (
          <HStack
            as={Link}
            to="/users"
            spacing={2}
            color={isUsersPath ? "brand.400" : "tetiary"}
          >
            <Icon as={FaUsersCog} />
            <Text
              color={isUsersPath ? "brand.400" : "tetiary"}
              fontWeight={isUsersPath ? "extrabold" : "medium"}
            >
              Users
            </Text>
          </HStack>
        ) : null}
        {role === UserRole.admin ||
        role === UserRole.master ||
        role === UserRole.reviewer ? (
          <HStack
            as={Link}
            to="/requests-admin"
            spacing={2}
            color={isRequestsAdminPath ? "brand.400" : "tetiary"}
          >
            <Icon as={BsBuilding} />
            <Text
              color={isRequestsAdminPath ? "brand.400" : "tetiary"}
              fontWeight={isRequestsAdminPath ? "extrabold" : "medium"}
            >
              Requests Admin
            </Text>
          </HStack>
        ) : null}
        {role === UserRole.admin ||
        role === UserRole.master ||
        role === UserRole.budgetHolder ||
        role === UserRole.reviewer ||
        role === UserRole.finance ? (
          <HStack
            as={Link}
            to="/requisition-admin"
            spacing={2}
            color={isAdminReqPath ? "brand.400" : "tetiary"}
          >
            <Icon as={GiTakeMyMoney} />
            <Text
              color={isAdminReqPath ? "brand.400" : "tetiary"}
              fontWeight={isAdminReqPath ? "extrabold" : "medium"}
            >
              Requisition Admin
            </Text>
          </HStack>
        ) : null}
        {role === UserRole.admin ||
        role === UserRole.driver ||
        role === UserRole.master ? (
          <HStack
            as={Link}
            to="/vehicle"
            spacing={2}
            color={isVehiclePath ? "brand.400" : "tetiary"}
          >
            <Icon as={BiCar} />
            <Text
              color={isVehiclePath ? "brand.400" : "tetiary"}
              fontWeight={isVehiclePath ? "extrabold" : "medium"}
            >
              Vehicle Admin
            </Text>
          </HStack>
        ) : null}
        {role === UserRole.admin || role === UserRole.master ? (
          <HStack
            as={Link}
            to="/system-settings"
            spacing={2}
            color={isSettingPath ? "brand.400" : "tetiary"}
          >
            <Icon as={BiCog} />
            <Text
              color={isSettingPath ? "brand.400" : "tetiary"}
              fontWeight={isSettingPath ? "extrabold" : "medium"}
            >
              System Settings
            </Text>
          </HStack>
        ) : null}
      </VStack>
      <HStack
        as={Button}
        onClick={onLogout}
        to="/"
        spacing={2}
        mt="auto"
        alignSelf="center"
        mb={10}
      >
        <Icon as={BsPower} />
        <Text>Logout</Text>
      </HStack>
    </Flex>
  );
};
