import React, { FC, useMemo } from "react";
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
  useBreakpointValue,
  Box,
  Badge,
} from "@chakra-ui/react";
import { AiOutlineMenu } from "react-icons/ai";
import { useAppSelector } from "../reducers/types";
import { AiOutlineCheckSquare, AiOutlineDashboard } from "react-icons/ai";
import { BsChat, BsCurrencyDollar, BsPower } from "react-icons/bs";
import { Link, useMatch } from "react-router-dom";
import { useLogout } from "../hooks/useLoadingAnimation";
import { UserRole } from "../types/Profile";
import { FaUsersCog } from "react-icons/fa";
import { GiTakeMyMoney } from "react-icons/gi";
import { MembersOnline } from "./MembersOnline";
import { BiBell } from "react-icons/bi";
import { NotifcationBox } from "./Notifications";

export const NotificationBar: FC = () => {
  const { auth, notifications } = useAppSelector(({ auth, notifications }) => ({
    auth,
    notifications,
  }));
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });
  const unreadNotifications = useMemo(() => {
    return notifications?.filter((not) => !not.read).length || 0;
  }, [notifications]);
  const { isOpen, onClose, onToggle } = useDisclosure();
  const isUsersRoute = !!useMatch("/users");
  const onLogout = useLogout();
  return (
    <>
      <Flex>
        <HStack spacing={0} mx={2} p={0} position="relative">
          <IconButton
            onClick={onToggle}
            icon={<BiBell />}
            aria-label="Menu Button"
          />
          {unreadNotifications ? (
            <Badge
              position="absolute"
              top={4}
              right={-2}
              ml={2}
              borderRadius="full"
              colorScheme="brand"
              size="sm"
            >
              {unreadNotifications}
            </Badge>
          ) : null}
        </HStack>
      </Flex>
      <Drawer isOpen={isOpen} onClose={onClose} size="xs" placement="right">
        <DrawerOverlay />
        <DrawerContent sx={{ width: "300px" }}>
          <DrawerHeader>
            <Heading fontSize="md" mb={3}>
              Notifications
            </Heading>
          </DrawerHeader>
          <DrawerBody>
            {notifications === null ? (
              <Text my={3} fontSize="md">
                Fetching...
              </Text>
            ) : notifications?.length ? (
              notifications.map((not) => (
                <NotifcationBox key={not.id} notification={not} />
              ))
            ) : (
              <Flex direction="column" alignItems="center">
                <Heading fontSize="xl">
                  {" "}
                  🔔 You dont have any notifications
                </Heading>
              </Flex>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
