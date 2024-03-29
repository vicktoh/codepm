import React, { FC } from "react";
import {
  Avatar,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  IconButton,
  VStack,
  HStack,
  useDisclosure,
  Icon,
  Text,
  Button,
} from "@chakra-ui/react";
import { AiOutlineMenu, AiOutlineRead } from "react-icons/ai";
import { useAppSelector } from "../reducers/types";
import { AiOutlineCheckSquare, AiOutlineDashboard } from "react-icons/ai";
import { BsChat, BsCurrencyDollar, BsPower } from "react-icons/bs";
import { Link, useMatch } from "react-router-dom";
import { useLogout } from "../hooks/useLoadingAnimation";
import { UserRole } from "../types/Profile";
import { FaUsersCog } from "react-icons/fa";
import { GiTakeMyMoney } from "react-icons/gi";
import { MembersOnline } from "./MembersOnline";
import { NotificationBar } from "./NotificationBar";
import { isMatch } from "lodash";
import { BiCar } from "react-icons/bi";

export const MobileNav: FC = () => {
  const auth = useAppSelector(({ auth }) => auth);
  const { isOpen, onClose, onToggle } = useDisclosure();
  const isUsersRoute = !!useMatch("/users");
  const isVehicleRoute = !!useMatch("/vehicle");
  const isRequestAdmin = !!useMatch("/requests-admin");
  const onLogout = useLogout();
  return (
    <>
      <Flex
        position="sticky"
        marginTop={0}
        top={0}
        zIndex={3}
        px={3}
        bg="white"
        width="100%"
        alignItems="center"
        py={3}
      >
        <IconButton
          onClick={onToggle}
          icon={<AiOutlineMenu />}
          aria-label="Menu Button"
        />
        <Heading fontSize="md" mx="auto">
          CODEPM
        </Heading>
        <Avatar
          as={Link}
          ml="auto"
          name={auth?.displayName || "Unknown user"}
          src={auth?.photoUrl || ""}
          size="sm"
          to="/profile"
        />
        <NotificationBar />
      </Flex>
      <Drawer isOpen={isOpen} onClose={onClose} size="xs" placement="left">
        <DrawerOverlay />
        <DrawerContent sx={{ width: "180px !important" }}>
          <DrawerHeader>
            <Heading fontSize="md" mb={3}>
              CODE
            </Heading>
            <MembersOnline />
          </DrawerHeader>
          <DrawerBody>
            <VStack
              alignItems="flex-start"
              alignSelf="center"
              mt={12}
              spacing={6}
            >
              <HStack
                as={Link}
                to="/"
                spacing={2}
                color={!!useMatch("/") ? "brand.400" : "tetiary"}
              >
                <Icon as={AiOutlineDashboard} />
                <Text>Dashboard</Text>
              </HStack>
              <HStack
                as={Link}
                to="/chat"
                spacing={2}
                color={!!useMatch("/chat") ? "brand.400" : "tetiary"}
              >
                <Icon as={BsChat} />
                <Text>Chats</Text>
              </HStack>
              <HStack
                as={Link}
                to="/logs"
                spacing={2}
                color={!!useMatch("/logs") ? "brand.400" : "tetiary"}
              >
                <Icon as={AiOutlineCheckSquare} />
                <Text>Logs</Text>
              </HStack>
              <HStack
                as={Link}
                to="/requisitions"
                spacing={2}
                color={!!useMatch("/requisitions") ? "brand.400" : "tetiary"}
              >
                <Icon as={BsCurrencyDollar} />
                <Text>Requisition</Text>
              </HStack>
              {auth?.role === UserRole.admin ||
              auth?.role === UserRole.master ? (
                <HStack
                  as={Link}
                  to="/users"
                  spacing={2}
                  color={isUsersRoute ? "brand.400" : "tetiary"}
                >
                  <Icon as={FaUsersCog} />
                  <Text>Users</Text>
                </HStack>
              ) : null}
              {auth?.role === UserRole.admin ||
              auth?.role === UserRole.master ||
              auth?.role === UserRole.reviewer ? (
                <HStack
                  as={Link}
                  to="/requests-admin"
                  spacing={2}
                  color={isRequestAdmin ? "brand.400" : "tetiary"}
                >
                  <Icon as={FaUsersCog} />
                  <Text>Requests Admin</Text>
                </HStack>
              ) : null}
              <HStack
                as={Link}
                to="/requests"
                spacing={2}
                color={!!useMatch("/requests") ? "brand.400" : "tetiary"}
              >
                <Icon as={AiOutlineRead} />
                <Text>Requests</Text>
              </HStack>

              {auth?.role === UserRole.admin ||
              auth?.role === UserRole.master ||
              auth?.role === UserRole.budgetHolder ||
              auth?.role === UserRole.reviewer ||
              auth?.role === UserRole.finance ? (
                <HStack
                  as={Link}
                  to="/requisition-admin"
                  spacing={2}
                  color={isUsersRoute ? "brand.400" : "tetiary"}
                >
                  <Icon as={GiTakeMyMoney} />
                  <Text>Requisition Admin</Text>
                </HStack>
              ) : null}
              {auth?.role === UserRole.admin ||
              auth?.role === UserRole.driver ||
              auth?.role === UserRole.master ? (
                <HStack
                  as={Link}
                  to="/vehicle"
                  spacing={2}
                  color={isVehicleRoute ? "brand.400" : "tetiary"}
                >
                  <Icon as={BiCar} />
                  <Text>Vehicle Admin</Text>
                </HStack>
              ) : null}
            </VStack>
            <HStack
              as={Button}
              to="/"
              spacing={2}
              mt={20}
              mb={10}
              onClick={onLogout}
            >
              <Icon as={BsPower} />
              <Text>Logout</Text>
            </HStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
