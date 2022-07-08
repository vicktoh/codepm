import {
  Avatar,
  HStack,
  Icon,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React, { FC, useState } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import { useAppSelector } from "../reducers/types";

type UserListPopverProps = {
  onSelectUser: (userId: string) => void;
  assignees: string[];
  onCloseSuccess?: () => void;
  closeOnSelect?: boolean;
};

export const UserListPopover: FC<UserListPopverProps> = ({
  children,
  onSelectUser,
  assignees,
  onCloseSuccess,
  closeOnSelect = false,
}) => {
  const [search, setSearch] = useState<string>("");
  const initialFocusRef = React.useRef();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { users, auth } = useAppSelector(({ users, auth }) => ({
    users,
    auth,
  }));

  const selectCallBack = (userId: string) => {
    onSelectUser(userId);
    if (closeOnSelect) {
      onClose();
    }
  };

  const afterClose = () => {
    if (onCloseSuccess) onCloseSuccess();
    onClose();
  };
  return (
    <Popover
      onOpen={onOpen}
      isOpen={isOpen}
      initialFocusRef={initialFocusRef.current}
      onClose={afterClose}
    >
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverHeader>
          <Input
            ref={initialFocusRef.current}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </PopoverHeader>
        <PopoverBody>
          {users?.users
            ? users.users
                .filter((user) => {
                  if (user.userId === auth?.uid) return false;
                  if (!search) return true;
                  const position = user.displayName
                    .toLowerCase()
                    .indexOf(search.toLowerCase());
                  if (position > -1) return true;
                  return false;
                })
                .map((user) => (
                  <HStack
                    alignItems="center"
                    key={user.userId}
                    cursor="pointer"
                    onClick={() => selectCallBack(user.userId)}
                    spacing={2}
                    py={2}
                  >
                    <Avatar
                      src={user.photoUrl}
                      name={user.displayName}
                      size="sm"
                    />
                    <Text fontSize="sm">{user.displayName}</Text>
                    {assignees.includes(user.userId) ? (
                      <Icon as={AiFillCheckCircle} color="green.300" />
                    ) : null}
                  </HStack>
                ))
            : null}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
