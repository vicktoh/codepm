import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Link,
  ListItem,
  OrderedList,
  Text,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React, { FC } from "react";
import { BsLink, BsPencil, BsTrash } from "react-icons/bs";
import { Log } from "../types/Log";

type LogComponentType = {
  log: Log;
  orientation?: "left" | "right";
  logIndex: number;
  onEdit: (logIndex: number, activityIndex: number) => void;
  onDelete: (logIndex: number, activityIndex: number) => void;
};
export const LogComponent: FC<LogComponentType> = ({
  log,
  orientation,
  logIndex,
  onEdit,
  onDelete,
}) => {
  const logDate = format(new Date(log.dateString), "do LLL Y");
  return (
    <Flex direction="column" py={2}>
      <Heading fontSize="lg" my={2} alignSelf="center">
        {logDate}
      </Heading>
      <Box
        alignSelf={orientation === "left" ? "flex-start" : "flex-end"}
        borderLeftWidth={orientation === "left" ? 0 : 2}
        borderRightWidth={orientation === "right" ? 0 : 2}
        width="50%"
        borderColor="tetiary.500"
        pl={orientation === "right" ? 5 : 0}
      >
        <OrderedList>
          {log.activity.map((activity, i) => (
            <ListItem my={3} role="group" key={`order-${log.dateString}-${i}`}>
              <Flex
                alignItems="center"
                direction="row"
                justifyContent="space-between"
              >
                <Text width="80%">{activity}</Text>
                <HStack>
                  <IconButton
                    icon={<Icon as={BsPencil} />}
                    aria-label="edit activity"
                    display="none"
                    boxSize={6}
                    variant="ghost"
                    onClick={() => onEdit(logIndex, i)}
                    _groupHover={{ display: "block" }}
                  />
                  <IconButton
                    boxSize={6}
                    onClick={() => onDelete(logIndex, i)}
                    variant="ghost"
                    icon={<Icon as={BsTrash} />}
                    aria-label="remove activity"
                    display="none"
                    _groupHover={{ display: "block" }}
                  />
                </HStack>
              </Flex>
            </ListItem>
          ))}
        </OrderedList>
      </Box>
      {log.link ? (
        <IconButton
          boxSize={6}
          as={Link}
          isExternal={log.link}
          variant="ghost"
          icon={<Icon as={BsLink} />}
          aria-label="remove activity"
        />
      ) : null}
    </Flex>
  );
};
