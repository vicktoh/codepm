import {
  Box,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from "@chakra-ui/react";
import React, { FC } from "react";
import { Document, ProjectDocument } from "../types/Project";
import { TaskDocumentForm } from "./TaskDocumentForm";

type DocumentPopoverProps = {
  document?: Document;
  onSubmit: (document: Document | ProjectDocument) => void;
};

export const DocumentPopover: FC<DocumentPopoverProps> = ({
  children,
  document,
  onSubmit,
}) => {
  const { onClose, onOpen, isOpen } = useDisclosure();
  return (
    <Popover isOpen={isOpen} onClose={onClose}>
      <PopoverTrigger>
        <Box onClick={onOpen}>{children}</Box>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverBody>
          {isOpen ? (
            <TaskDocumentForm
              document={document}
              onSubmit={onSubmit}
              onClose={onClose}
            />
          ) : null}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
