import  { FC, useMemo, useState } from 'react';

import {
    Input,
    Tag,
    Td,
    Tr,
    useBreakpointValue,
    Tooltip,
    Text,
    HStack,
    AvatarGroup,
    Avatar,
    Icon,
    useToast,
} from '@chakra-ui/react';
import { Timestamp } from 'firebase/firestore';
import { AiOutlineCalendar, AiOutlineFileText } from 'react-icons/ai';
import { STATUS_COLORSCHEME } from '../constants';
import { useLoadingAnimation } from '../hooks/useLoadingAnimation';
import { useAppSelector } from '../reducers/types';
import { addTaskToDb } from '../services/taskServices';
import { Project, Task, TaskStatus } from '../types/Project';

type TaskRowProps = {
    task: Task & { draft?: boolean };
    project: Project;
    workplanId: string;
    openTask: (task: Task) => void;
};

export const TaskRow: FC<TaskRowProps> = ({ task, project, workplanId, openTask }) => {
    const { users, auth } = useAppSelector(({ users, auth }) => ({
        users,
        auth,
    }));
    const [title, setTitle] = useState<string>('');
    const [isSaving, setSaving] = useState<boolean>(false);
    const loadingAnimation = useLoadingAnimation();
    const inputSize = useBreakpointValue({ base: 'xs', md: 'sm', lg: 'sm' });
    const toast = useToast();
    const assigneeesTorender = useMemo(() => {
        if (!task?.assignees) return null;
        if (task.assignees.length > 3) {
            const assignees = task.assignees.slice(3);
            return {
                assignees,
                count: task.assignees.length - 3,
            };
        }
        return {
            assignees: task.assignees,
        };
    }, [task.assignees]);

    const addTaskDraft = async () => {
        const newTask: Task = {
            title,
            timestamp: Timestamp.now(),
            projectFunder: project.funder,
            projectId: project.id,
            projectTitle: project.title,
            workplanId,
            creatorId: auth?.uid || '',
            status: TaskStatus.planned,
        };
        try {
            setSaving(true);
            await addTaskToDb(project.id, newTask);
        } catch (error) {
            const err: any = error;
            toast({
                title: 'Could not save this task',
                description: err?.message || 'Unknown error',
                status: 'error',
            });
        } finally {
            setSaving(false);
        }
    };
    if (task?.draft) {
        return (
            <Tr bg="white" animation={isSaving ? loadingAnimation : undefined}>
                <Td borderLeftRadius="lg">
                    <Input

                        disabled={isSaving}
                        onBlur={addTaskDraft}
                        size={inputSize}
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </Td>
                <Td>Not assigned</Td>
                <Td>-</Td>
                <Td>No attachements</Td>
                <Td borderRightRadius="lg">
                    <Tag colorScheme={STATUS_COLORSCHEME[task.status]}>
                        {task.status}
                    </Tag>
                </Td>
            </Tr>
        );
    }
    return (
        <Tr bg="white">
            <Td cursor="pointer" borderLeftRadius="lg" onClick={()=> openTask(task)}>
                <Tooltip label={task.title}>
                    <Text isTruncated noOfLines={1}>
                        {task.title}
                    </Text>
                </Tooltip>
            </Td>
            <Td>
                {assigneeesTorender ? (
                    <HStack>
                        <AvatarGroup spacing="-1rem">
                            {assigneeesTorender.assignees.map((user) => (
                                <Avatar
                                    key={`user-avatar-${user}`}
                                    size="sm"
                                    src={
                                        users?.usersMap
                                            ? users.usersMap[user]?.photoUrl ||
                                              ''
                                            : ''
                                    }
                                    name={
                                        users?.usersMap
                                            ? users.usersMap[user]
                                                  ?.displayName ||
                                              'Unknown user'
                                            : 'Unknown user'
                                    }
                                />
                            ))}
                        </AvatarGroup>
                        {assigneeesTorender.count ? (
                            <Text>{`and ${assigneeesTorender.count} more`}</Text>
                        ) : null}
                    </HStack>
                ) : (
                    <Text color="gray.300">Not assigned to anyone</Text>
                )}
            </Td>
            <Td>
               <HStack spacing={1}>
                  <Icon as = {AiOutlineFileText} />
                  <Text color = "blue.300">{task?.attachments?.length || 0}</Text>
               </HStack>
            </Td>
            <Td>
                {task.dueDate ? (
                    <HStack>
                        <Icon as={AiOutlineCalendar} color="blue.300" />
                        <Text>{`${task.dueDate.startDate} - ${
                            task.dueDate.dueDate || '*'
                        }`}</Text>
                    </HStack>
                ) : (
                    'No due dates assigned'
                )}
            </Td>
            <Td borderRightRadius="lg">
                <Tag colorScheme={STATUS_COLORSCHEME[task.status]}>
                    {task.status}
                </Tag>
            </Td>
        </Tr>
    );
};
