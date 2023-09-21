import {
  Badge,
  Button,
  ChakraProps,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import { formatDistanceToNow } from "date-fns";
import React, { FC, useMemo } from "react";
import { BiBell } from "react-icons/bi";
import { MdNotifications } from "react-icons/md";
import { Link } from "react-router-dom";
import { Box } from "victory";
import { useAppSelector } from "../reducers/types";
import { markNotificationAsRead } from "../services/notificationServices";
import { Notification, ReduxNotification } from "../types/Notification";

type NotificationBoxProps = {
  notification: ReduxNotification;
  onClose: () => void;
};

const iconMap: Record<Notification["type"], string> = {
  request: "📝",
  requisition: "🤑",
  tasks: "💼",
};
export const NotifcationBox: FC<NotificationBoxProps> = ({
  notification,
  onClose,
}) => {
  const { title, timestamp, description, linkTo, read } = notification;
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });

  const onReadNotifications = async () => {
    try {
      await markNotificationAsRead(
        notification.id || "",
        notification.reciepientId,
      );
    } catch (error) {
      console.log({ error });
    }
  };
  return (
    <Flex
      direction="column"
      borderRadius="lg"
      px={3}
      pt={8}
      pb={3}
      my={2}
      bg={read ? "transparent" : "red.50"}
      textColor="black"
      onClick={onReadNotifications}
      cursor="pointer"
      position="relative"
      border={read ? "1px solid red" : "none"}
      borderColor={read ? "red.100" : "none"}
      shadow="sm"
    >
      <HStack alignItems="center" spacing={4} mb={2}>
        <Heading fontSize="md">{iconMap[notification.type] || "🔔"}</Heading>
        <Heading color={"black"} fontSize="md">
          {title}
        </Heading>
      </HStack>
      <Text color={"black"} fontSize="xs">
        {description}
      </Text>
      {linkTo ? (
        <Button
          alignSelf="flex-end"
          color="red.300"
          variant="solid"
          size="xs"
          mt={3}
          onClick={onClose}
          as={Link}
          to={linkTo}
        >
          Take me there
        </Button>
      ) : null}
      <Text
        fontWeight="bold"
        fontSize="xs"
        position="absolute"
        top={3}
        right={3}
        color="brand.500"
      >
        {`${formatDistanceToNow(notification.timestamp as number)} ago`}
      </Text>
    </Flex>
  );
};
export const Notifications: FC = () => {
  const { notifications } = useAppSelector(({ notifications }) => ({
    notifications,
  }));
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });
  const unreadNotifications = useMemo(() => {
    return notifications?.filter((not) => !not.read).length || 0;
  }, [notifications]);
  const initialFocusRef = React.useRef();
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <Popover
      onOpen={onOpen}
      isOpen={isOpen}
      placement="bottom-start"
      initialFocusRef={initialFocusRef.current}
      onClose={onClose}
    >
      <PopoverTrigger>
        <Button
          colorScheme="orange"
          leftIcon={<Icon as={BiBell} />}
          aria-label="noticication"
        >
          Notifications
          {unreadNotifications ? (
            <Badge ml={2} borderRadius="full" colorScheme="brand" size="sm">
              {unreadNotifications}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        {/* <PopoverHeader>My Notifications</PopoverHeader> */}
        <PopoverBody>
          <Flex direction="column" maxHeight="300px" overflowY="auto">
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
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
