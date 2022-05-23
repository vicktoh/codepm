import {
    Flex,
    Heading,
    HStack,
    Icon,
    IconButton,
    Text,
    Tooltip,
    Link,
} from '@chakra-ui/react';
import { Timestamp } from 'firebase/firestore';
import React, { FC } from 'react';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsTrash } from 'react-icons/bs';
import { FiEye } from 'react-icons/fi';
import { ProjectDocument } from '../types/Project';

type DocumentCardProps = {
    document: ProjectDocument;
    onEdit: () => void;
    onDelete: () => void;
};

export const DocumentCard: FC<DocumentCardProps> = ({
    document: { title, url, dateAdded, addedBy },
    onEdit = () => null,
    onDelete = () => null,
}) => {
    return (
        <Flex
            p={5}
            direction="column"
            width="100%"
            height="100%"
            flex="1 1"
            bg="white"
            borderRadius="lg"
        >
            <Tooltip label={title} bg="tetiary.200" placement="top">
                <Heading fontSize={['lg', '2xl']} my={2} noOfLines={2}>
                    {title}
                </Heading>
            </Tooltip>

            <Text fontSize="xs" mb={1}>{`Added by: ${addedBy}`}</Text>
            <Text fontSize="xs" color="brand.300" mb={2}>{`${(dateAdded as Timestamp)
                .toDate()
                .toLocaleDateString()}`}</Text>
            <HStack spacing={3} mt="auto">
                <Tooltip
                    label="View document"
                    bg="tetiary.200"
                    placement="top"
                >
                    <IconButton
                        as={Link}
                        href={url}
                        aria-label="view project doc"
                        color="purple.400"
                        icon={<Icon as={FiEye} />}
                        size="sm"
                        isExternal
                    />
                </Tooltip>
                <Tooltip
                    label="Edit document "
                    bg="tetiary.200"
                    placement="top"
                >
                    <IconButton
                        aria-label="edit document"
                        color="blue.400"
                        icon={<Icon as={AiOutlineEdit} />}
                        onClick={onEdit}
                        size="sm"
                    />
                </Tooltip>

                <Tooltip
                    label="Delete project"
                    bg="tetiary.200"
                    placement="top"
                >
                    <IconButton
                        size="sm"
                        aria-label="view project"
                        color="red.300"
                        icon={<Icon as={BsTrash} />}
                        onClick={onDelete}
                    />
                </Tooltip>
            </HStack>
        </Flex>
    );
};
