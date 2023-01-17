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
} from "@chakra-ui/react";
import React, { FC, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../reducers/types";
import { setUserRole } from "../services/userServices";
import { UserRole } from "../types/Profile";
import { User } from "../types/User";

type UserRowProps = {
  user: User;
  updateUser: (role: UserRole) => void;
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
  },
  updateUser,
}) => {
  const { onClose, onOpen, isOpen } = useDisclosure();
  const { auth } = useAppSelector(({ auth }) => ({ auth }));
  const [loading, setLoading] = useState<boolean>(false);
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
        <Button as={Link} to={`/users/profile/${objectID}`}>
          Profile
        </Button>
      </HStack>
    </Flex>
  );
};
