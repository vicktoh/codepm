import React, { FC, useState } from 'react';
import {
    Checkbox,
    Flex,
    HStack,
    Icon,
    IconButton,
    Input,
    Text,
} from '@chakra-ui/react';
import { TodoItem } from '../types/Project';
import { AiOutlineEdit, AiOutlineSave } from 'react-icons/ai';
import { BsTrash } from 'react-icons/bs';
type TodoComponentItem = {
    todoItem: TodoItem;
    mode: 'view' | 'edit';
};
type TodoItemComponentProps = {
    todoItem: TodoItem;
    index: number;
    onCheckTodo: (index: number, value: boolean) => void;
    onSetTodoLabel: (index: number, newlabel: string) => void;
    onRemoveTodoItem: (index:number) => void;
};
export const TodoItemComponent: FC<TodoItemComponentProps> = ({
    todoItem,
    index,
    onSetTodoLabel,
    onCheckTodo,
    onRemoveTodoItem
}) => {
    const [mode, setMode] = useState<TodoComponentItem['mode']>(todoItem.label ? 'view' : 'edit');
    const [newTodoLabel, setTodoLabel] = useState<string>(todoItem.label);

    const saveNewTodoItem = () => {
        onSetTodoLabel(index, newTodoLabel);
        setMode('view');
    };
    if (mode === 'view') {
        return (
            <Flex
                
                width="100%"
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                py={3}
                px={2}
            >
                <HStack spacing={2}>
                    <Checkbox
                        onChange={(e) => onCheckTodo(index, e.target.checked)}
                        isChecked={todoItem.checked}
                        colorScheme="brand"
                    />
                    <Text
                        textDecor={todoItem.checked ? "line-through" : 'none'}
                        fontSize="md"
                    >
                        {todoItem.label}
                    </Text>
                </HStack>
                <HStack>
                <IconButton
                    size="xs"
                    aria-label="modify"
                    icon={<Icon as={AiOutlineEdit} />}
                    variant="outline"
                    onClick={() => setMode('edit')}
                />
                <IconButton
                    size="xs"
                    aria-label="modify"
                    icon={<Icon as={BsTrash} />}
                    variant="outline"
                    onClick={() => onRemoveTodoItem(index)}
                />
                </HStack>
               
            </Flex>
        );
    }

    return (
        <HStack
           
          spacing={3}
            alignItems="center"
        >
            <Input
                size = "sm"
                width="max-content"
                onBlur={saveNewTodoItem}
                type="text"
                value={newTodoLabel}
                onChange={(e) => {
                    setTodoLabel(e.target.value);
                }}
            />
            <IconButton
                onClick={saveNewTodoItem}
                size="xs"
                aria-label="save todo item"
                icon={<Icon as={AiOutlineSave} color="blue.300" />}
            />
        </HStack>
    );
};
