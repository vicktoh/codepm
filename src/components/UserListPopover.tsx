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
} from "@chakra-ui/react";
import React, { FC, useState } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import { useAppSelector } from "../reducers/types";

type UserListPopverProps = {
  onSelectUser: (userId: string) => void;
  assignees: string[];
  saveTask: () => void;
};

export const UserListPopover: FC<UserListPopverProps> = ({
  children,
  onSelectUser,
  assignees,
  saveTask,
}) => {
  const [search, setSearch] = useState<string>("");
  const initialFocusRef = React.useRef();
  const users = useAppSelector(({ users }) => users);
  return (
    <Popover initialFocusRef={initialFocusRef.current} onClose={saveTask}>
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
                    onClick={() => onSelectUser(user.userId)}
                    my={2}
                    spacing={2}
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
