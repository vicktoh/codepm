import {
    Heading,
    HStack,
    Icon,
    IconButton,
    Tooltip,
    useBreakpointValue,
} from '@chakra-ui/react';
import React, { FC } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
type KanbanColumnHeaderProps = {
    column: { title: string; id: number };
    onAddNew: () => void;
};
export const KanbanColumnHeader: FC<KanbanColumnHeaderProps> = ({
    onAddNew,
    column,
}) => {
    const plusButtonSize = useBreakpointValue({
        base: 'md',
        md: 'lg',
        lg: 'lg',
    });
    return (
        <HStack alignItems="center" spacing={3}>
            <Heading fontSize="md">{column.title}</Heading>
            <Tooltip label="Add new task">
                <IconButton
                    alignSelf="flex-start"
                    my={3}
                    aria-label="add newTask"
                    size={plusButtonSize}
                    transition="background 700ms ease-out"
                    icon={<Icon as={AiOutlinePlus} />}
                    variant="ghost"
                    onClick={onAddNew}
                    borderRadius="full"
                    _hover={{
                        background: 'brand.400',
                        color: 'white',
                    }}
                />
            </Tooltip>
        </HStack>
    );
};
