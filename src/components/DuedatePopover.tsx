import React, { FC } from "react";
import {
  Box,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  useDisclosure,
} from "@chakra-ui/react";
import { TimePeriod } from "../types/Project";
import { DueDateForm } from "./DueDateForm";

type DuedatePopoverProps = {
  onSubmit: (values: TimePeriod) => void;
  timePeriod?: TimePeriod;
  saveTask: () => void;
};

export const DuedatePopover: FC<DuedatePopoverProps> = ({
  children,
  onSubmit,
  timePeriod,
  saveTask,
}) => {
  const { onClose, onOpen, isOpen } = useDisclosure();

  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={saveTask}>
      <PopoverTrigger>
        <Box onClick={onOpen}>{children}</Box>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverHeader></PopoverHeader>
        <PopoverBody>
          {isOpen ? (
            <DueDateForm
              timePeriod={timePeriod}
              onClose={onClose}
              onSubmit={(values) => {
                onSubmit(values);
                onClose();
              }}
            />
          ) : null}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
