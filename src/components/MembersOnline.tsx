import {
  Avatar,
  AvatarBadge,
  Box,
  Heading,
  HStack,
  Text,
  Tooltip,
  useBreakpoint,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import React, { FC } from "react";
import { useAppSelector } from "../reducers/types";

export const MembersOnline: FC = () => {
  const { presence, users } = useAppSelector(({ presence, users }) => ({
    presence,
    users,
  }));
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });
  return (
    <Box>
      {isMobile ? null : <Heading fontSize="sm">Members Online</Heading>}
      {presence && users?.usersMap ? (
        <HStack
          mt={2}
          spacing="-.5rem"
          maxWidth={isMobile ? "100px" : "300px"}
          overflowX="auto"
          overflowY="hidden"
          pb={isMobile ? 0 : 3}
        >
          {Object.entries(presence)
            .filter(([key, presence]) => presence.state === "online")
            .map(([userId, presence]) => (
              <Tooltip
                key={`userPresence-${userId}`}
                label={users.usersMap[userId]?.displayName}
              >
                <Avatar
                  size={isMobile ? "xs" : "sm"}
                  src={users.usersMap[userId]?.photoUrl}
                  name={users.usersMap[userId]?.displayName}
                >
                  <AvatarBadge boxSize="0.75em" bg="green.500" />
                </Avatar>
              </Tooltip>
            ))}
        </HStack>
      ) : (
        <Text>None</Text>
      )}
    </Box>
  );
};
