import React, { FC } from 'react';
import { Flex } from '@chakra-ui/react';
// @ts-ignore
import Board from '@asseinfo/react-kanban';
import '@asseinfo/react-kanban/dist/styles.css';
import '../App.css';
import { Project, Task, TaskStatus } from '../types/Project';
import { STATUS_INDEX_MAP, tasksToKanbanBoard } from '../services/helpers';
import { KanbanCard } from './KanbanCard';
import { updateDbTask } from '../services/taskServices';
import { Timestamp } from 'firebase/firestore';
import { KanbanColumnHeader } from './KanbanColumnHeader';

type KanbanWorklanViewProps = {
    tasks: Task[];
    project: Project;
    workplanId: string;
    setTask: (task: Task) => void;
    openTask: (task: Task) => void;
};

export const KanbanWorkPlanView: FC<KanbanWorklanViewProps> = ({
    tasks,
    project,
    workplanId,
    setTask,
    openTask,
}) => {
    const addNewTaskDraft = (status: TaskStatus) => {
        const newTask: Task & { draft: boolean } = {
            title: '',
            draft: true,
            status,
            timestamp: Timestamp.now(),
            workplanId,
            projectId: project.id,
            projectFunder: project.funder,
            creatorId: '',
            projectTitle: project.title,
        };
        setTask(newTask);
    };
    const board = tasksToKanbanBoard(tasks);
    async function handleCardMove(
        _card: Task,
        source: { fromPosition: number; fromColumnId: number },
        destination: { toPosition: number; toColumnId: number }
    ) {
        if (source.fromColumnId === destination.toColumnId) return;
        const index = tasks.findIndex((task) => task.id === _card.id);
        if (index > -1) {
            const task = tasks[index];
            setTask({
                ...task,
                status: STATUS_INDEX_MAP[destination.toColumnId - 1],
            });
            updateDbTask(task.projectId || '', task.id || '', {
                status: STATUS_INDEX_MAP[destination.toColumnId - 1],
            });
        }
    }

    return (
        <Flex>
            <Board
                onCardDragEnd={handleCardMove}
                renderCard={(card: Task) => (
                    <KanbanCard
                        project={project}
                        workplanId={workplanId}
                        task={card}
                        openTask={() => openTask(card)}
                    />
                )}
                
                onCardNew={addNewTaskDraft}
                renderColumnHeader={(
                    column: { title: string; id: number },
                    columnBag: any
                ) => {
                    return (
                        <KanbanColumnHeader
                            column={column}
                            onAddNew={() =>
                                addNewTaskDraft(STATUS_INDEX_MAP[column.id - 1])
                            }
                            key={`column-${column.id}`}
                        />
                    );
                }}
            >
                {board}
            </Board>
        </Flex>
    );
};
