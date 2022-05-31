import React, { FC } from 'react';
import {
    Box,
    HStack,
    Icon,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Tag,
    useDisclosure,
} from '@chakra-ui/react';
import { TaskStatus } from '../types/Project';
import { STATUS_COLORSCHEME } from '../constants';
import { AiFillCheckCircle } from 'react-icons/ai';

type StatusPopoverProps = {
    onSelect: (status: TaskStatus) => void;
    currentStatus?: TaskStatus;
};

export const StatusPopover: FC<StatusPopoverProps> = ({
    children,
    currentStatus,
    onSelect
}) => {
    const { isOpen, onClose, onOpen } = useDisclosure();

    return (
        <Popover placement="bottom-start" isOpen={isOpen} onClose={onClose}>
            <PopoverTrigger>
                <Box width="max-content" onClick={onOpen} alignSelf="start">{children}</Box>
            </PopoverTrigger>
            <PopoverContent>
                <PopoverBody>
                    {Object.values(TaskStatus).map((value) => (
                        <HStack spacing={3} my={3} cursor="pointer" key={value} onClick={()=> {
                           onSelect(value);
                           onClose();
                           
                        }}>
                            <Tag colorScheme={STATUS_COLORSCHEME[value]}>
                                {value}
                            </Tag>
                            {currentStatus === value ? (
                                <Icon
                                    as={AiFillCheckCircle}
                                    color="green.300"
                                />
                            ) : null}
                        </HStack>
                    ))}
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
};
