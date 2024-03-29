import {
  Avatar,
  Flex,
  Heading,
  HStack,
  VStack,
  Text,
  Popover,
  useDisclosure,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Button,
  useToast,
  useBreakpoint,
  useBreakpointValue,
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import React, { FC, useState } from "react";
import { BiUserPin } from "react-icons/bi";
import { BsCalendarCheck, BsThreeDots } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useAppSelector } from "../reducers/types";
import { disableUser, enableUser, setUserRole } from "../services/userServices";
import { UserRole } from "../types/Profile";
import { User } from "../types/User";

type UserRowProps = {
  user: User;
  updateUser: (role: UserRole) => void;
  updateBlocked: (blocked: boolean) => void;
};
export const UserRow: FC<UserRowProps> = ({
  user: {
    objectID,
    designation,
    userId,
    displayName,
    department,
    role,
    photoUrl,
    blocked,
  },
  updateUser,
  updateBlocked,
}) => {
  const { onClose, onOpen, isOpen } = useDisclosure();
  const { auth } = useAppSelector(({ auth }) => ({ auth }));
  const [loading, setLoading] = useState<boolean>(false);
  const [blocking, setBlocking] = useState<boolean>(false);
  const toast = useToast();
  const isMobile = useBreakpointValue({ lg: false, md: false, base: true });
  const setRole = async (role: UserRole) => {
    try {
      onClose();
      setLoading(true);
      const res = await setUserRole({ userId: objectID || userId, role });
      console.log({ res });
      if (res.data.status === "failed") {
        toast({
          title: "Could not assign role to user, try again",
          status: "error",
        });
        return;
      }
      updateUser(role);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const userStatusMod = async (disable: boolean) => {
    try {
      setBlocking(true);
      if (disable) {
        // console.log({ userId });
        const result = await disableUser({ userId: objectID || userId });
        console.log({ result });
      } else {
        await enableUser({ userId: objectID || userId });
      }
      updateBlocked(disable);
    } catch (error) {
      toast({
        title: "Something went wrong",
        status: "error",
      });
    } finally {
      setBlocking(false);
    }
  };
  return (
    <Flex
      alignItems={isMobile ? "flex-start" : "center"}
      direction={isMobile ? "column" : "row"}
      py={3}
      px={5}
      my={1}
      bg="white"
      borderRadius="lg"
    >
      <HStack spacing={3} alignItems="center">
        <Avatar name={displayName} src={photoUrl} size="md" />
        <VStack alignItems="flex-start" spacing={0}>
          <Heading fontSize="md">{displayName}</Heading>
          <Text fontSize="sm">{department || "N/A"}</Text>
        </VStack>
      </HStack>

      <Text ml={isMobile ? 0 : "auto"} mt={isMobile ? 3 : 0} mr={3}>
        {designation || "user"}
      </Text>
      <HStack spacing={3} mt={isMobile ? 5 : 0}>
        {blocked ? (
          <Button
            size="md"
            isLoading={blocking}
            disabled={auth?.role !== UserRole.master}
            onClick={() => userStatusMod(false)}
          >
            Enable User
          </Button>
        ) : (
          <Button
            size="md"
            isLoading={blocking}
            disabled={auth?.role !== UserRole.master}
            onClick={() => userStatusMod(true)}
          >
            Disable User
          </Button>
        )}
        <Popover onOpen={onOpen} isOpen={isOpen} onClose={onClose}>
          <PopoverTrigger>
            <Button
              isLoading={loading}
              size="md"
              disabled={auth?.role !== UserRole.master}
            >
              {role || "User"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverBody>
              <Flex rowGap={2} direction="column">
                {Object.values(UserRole).map((key, i) => (
                  <Button
                    color={key === role ? "red.400" : "tetiary.300"}
                    key={`userrole-${key}`}
                    py={2}
                    px={5}
                    onClick={() => setRole(key)}
                  >
                    <Text>{key}</Text>
                  </Button>
                ))}
              </Flex>
            </PopoverBody>
          </PopoverContent>
        </Popover>
        <Menu>
          <MenuButton as={IconButton} icon={<BsThreeDots />} />
          <MenuList>
            <MenuItem as={Link} to={`/users/profile/${objectID}`}>
              <HStack>
                <BiUserPin />
                <Text>Profile</Text>
              </HStack>
            </MenuItem>
            <MenuItem as={Link} to={`/users/attendance/${objectID}`}>
              <HStack>
                <BsCalendarCheck />
                <Text>Attendance</Text>
              </HStack>
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
};
