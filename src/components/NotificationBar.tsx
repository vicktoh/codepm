import React, { FC, useCallback, useMemo, useState } from "react";
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
  HStack,
  useDisclosure,
  Text,
  Button,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { useAppSelector } from "../reducers/types";

import { BiBell, BiTrash } from "react-icons/bi";
import { NotifcationBox } from "./Notifications";
import { markAllNotificationsAsRead } from "../services/notificationServices";
import { deleteNotifications } from "../services/userServices";
export const NotificationBar: FC = () => {
  const { notifications, auth } = useAppSelector(({ notifications, auth }) => ({
    notifications,
    auth,
  }));
  const unreadNotifications = useMemo(() => {
    return notifications?.filter((not) => !not.read).length || 0;
  }, [notifications]);
  const [marking, setMarking] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
  const emptyNotifications = useCallback(async () => {
    try {
      setDeleting(true);
      const res = await deleteNotifications();
    } catch (error) {
      const err: any = error;
      console.log(error);
      toast({
        title: "Could not read all notifications",
        description: err?.message || "Something went wrong please try again",
        status: "error",
      });
    } finally {
      setDeleting(false);
    }
  }, [toast]);
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
            <Heading fontSize="md">Notifications</Heading>
            <Flex
              alignItems="center"
              direction="row"
              justifyContent="flex-end"
              gap={3}
            >
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
              {notifications?.length ? (
                <Button
                  size="sm"
                  variant="outline"
                  color="red.300"
                  isLoading={deleting}
                  onClick={emptyNotifications}
                  leftIcon={<BiTrash />}
                >
                  Empty
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
