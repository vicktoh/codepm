import React, { FC } from 'react';
import {
    Flex,
    Icon,
    IconButton,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tooltip,
    Tr,
    useBreakpointValue,
} from '@chakra-ui/react';
import { AiOutlinePlus } from 'react-icons/ai';
import { Project, Task, TaskStatus } from '../types/Project';
import { TaskRow } from './TaskRow';
import { Timestamp } from 'firebase/firestore';

type TableViewWorkPlanProps = {
    tasks: Task[];
    project: Project;
    workplanId: string;
    setTask: (task: Task) => void;
    openTask: (task: Task) => void;
};

export const TableViewWorkPlan: FC<TableViewWorkPlanProps> = ({
    tasks,
    project,
    workplanId,
    setTask,
    openTask
}) => {
    
    const plusButtonSize = useBreakpointValue({
        base: 'md',
        md: 'lg',
        lg: 'lg',
    });
    const talbeSize = useBreakpointValue({base: "sm", md: "md", lg: "md"})

    const addNewTaskDraft = () => {
       const newTask : Task & {draft:boolean} = {
          title: '',
          draft:true,
          status: TaskStatus.planned,
          timestamp: Timestamp.now(),
          workplanId,
          projectId: project.id,
          projectFunder: project.funder,
          creatorId: '',
          projectTitle: project.title
       }
       setTask(newTask);
    };
    return (
        <Flex direction="column">
            <Tooltip label="Add new task">
                <IconButton
                    alignSelf="flex-start"
                    my={3}
                    aria-label="add newTask"
                    size={plusButtonSize}
                    transition="background 700ms ease-out"
                    icon={<Icon as={AiOutlinePlus} />}
                    variant="ghost"
                    onClick={addNewTaskDraft}
                    borderRadius="full"
                    _hover={{
                        background: 'brand.400',
                        color: 'white',
                    }}
                />
            </Tooltip>

            <TableContainer  mt={5} maxWidth="100%" whiteSpace="normal">
                <Table
                size={talbeSize}
                sx={{
                    borderCollapse: 'separate',
                    borderSpacing: '0 5px',
                }}
                >
                    <Thead>
                        <Tr>
                            <Th>title</Th>
                            <Th>assignees</Th>
                            <Th>attachments</Th>
                            <Th>due dates</Th>
                            <Th>status</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {tasks.length ? (
                            tasks.map((task, i) => (
                                <TaskRow
                                    openTask={openTask}
                                    key={`task-row-${i}`}
                                    task={task as Task}
                                    project={project}
                                    workplanId={workplanId}
                                />
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan={6} textAlign="center">
                                    <Text>
                                        There are no tasks yet on the workplan
                                    </Text>
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </TableContainer>
        </Flex>
    );
};
