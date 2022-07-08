import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from "@chakra-ui/react";
import React, { FC, useState } from "react";

type NewGroupPopoverProps = {
  onSubmit: (groupname: string) => void;
};

export const NewGroupPopover: FC<NewGroupPopoverProps> = ({
  children,
  onSubmit,
}) => {
  const { onClose, onOpen, isOpen } = useDisclosure();
  const [groupname, setGroupName] = useState<string>("");

  const onCreateNewGroup = () => {
    if (!groupname) return;
    onSubmit(groupname);
    onClose();
  };
  return (
    <Popover isOpen={isOpen} onClose={onClose}>
      <PopoverTrigger>
        <Box onClick={onOpen}>{children}</Box>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverBody>
          {isOpen ? (
            <Flex direction="column" px={5} py={3}>
              <FormControl>
                <FormLabel>Name of Group</FormLabel>
                <Input
                  value={groupname}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </FormControl>
              <Button onClick={onCreateNewGroup} my={3} colorScheme="brand">
                Add Group
              </Button>
            </Flex>
          ) : null}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
