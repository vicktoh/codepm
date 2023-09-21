import React, { FC, useMemo, useState } from "react";
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
  useToast,
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
import { markAllNotificationsAsRead } from "../services/notificationServices";

export const NotificationBar: FC = () => {
  const { notifications, auth } = useAppSelector(({ notifications, auth }) => ({
    notifications,
    auth,
  }));
  const unreadNotifications = useMemo(() => {
    return notifications?.filter((not) => !not.read).length || 0;
  }, [notifications]);
  const [marking, setMarking] = useState(false);
  const toast = useToast();
  const { isOpen, onClose, onToggle } = useDisclosure();

  const readAllNotification = async () => {
    console.log(notifications);
    try {
      setMarking(true);
      await markAllNotificationsAsRead(notifications || [], auth?.uid || "");
    } catch (error) {
      const err: any = error;
      console.log(error);
      toast({
        title: "Could not read all notifications",
        status: "error",
      });
    } finally {
      setMarking(false);
    }
  };
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
            <Flex
              alignItems="center"
              direction="row"
              justifyContent="space-between"
            >
              <Heading fontSize="md">Notifications</Heading>

              {notifications?.length && unreadNotifications ? (
                <Button
                  size="sm"
                  variant="ghost"
                  color="green.300"
                  isLoading={marking}
                  onClick={readAllNotification}
                >
                  Mark all as read
                </Button>
              ) : null}
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            {notifications === null ? (
              <Text my={3} fontSize="md">
                Fetching...
              </Text>
            ) : notifications?.length ? (
              notifications.map((not) => (
                <NotifcationBox
                  key={not.id}
                  notification={not}
                  onClose={onClose}
                />
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
