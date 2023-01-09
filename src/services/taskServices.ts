import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { Task, TaskComment } from "../types/Project";
import { db } from "./firebase";

export const addTaskToDb = async (projectId: string, task: Task) => {
  const collectionRef = collection(db, `projects/${projectId}/tasks`);
  const docRef = doc(collectionRef);
  task.id = docRef.id;
  return setDoc(docRef, task);
};

export const updateDbTask = async (
  projectId: string,
  taskId: string,
  change: any,
) => {
  const docRef = doc(db, `projects/${projectId}/tasks/${taskId}`);
  await updateDoc(docRef, change);
};

export const removeTask = async (projectId: string, task: Task) => {
  const docRef = doc(db, `projects/${projectId}/tasks/${task.id}`);
  return deleteDoc(docRef);
};
export const listenOnMyTasks = (
  userId: string,
  callback: (task: Task[]) => void,
) => {
  const collectionRef = collectionGroup(db, "tasks");
  const q = query(collectionRef, where("assignees", "array-contains", userId));
  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = [];
    snapshot.forEach((snap) => {
      const task = snap.data() as Task;
      tasks.push(task);
    });
    callback(tasks);
  });
};

export const fetchUserTasks = async (userId: string) => {
  const collectionRef = collectionGroup(db, "tasks");
  const q = query(collectionRef, where("assignees", "array-contains", userId));
  const snapshot = await getDocs(q);
  const tasks: Task[] = [];
  snapshot.forEach((snap) => {
    const task = snap.data() as Task;
    task.id = snap.id;
    tasks.push(task);
  });
  return tasks;
};

export const fetchProjectsTasks = async (projectId: string) => {
  const collectionRef = collection(db, `projects/${projectId}/tasks`);
  const snapshot = await getDocs(collectionRef);
  const tasks: Task[] = [];
  snapshot.forEach((snap) => {
    const task = snap.data() as Task;
    task.id = snap.id;
    tasks.push(task);
  });
  return tasks;
};

export const writeComment = async (
  projectId: string,
  taskId: string,
  comment: TaskComment,
) => {
  const commentCollectionRef = collection(
    db,
    `projects/${projectId}/tasks/${taskId}/comments`,
  );

  return addDoc(commentCollectionRef, comment);
};

export const listenOnTaskComment = (
  projectId: string,
  taskId: string,
  callback: (comments: TaskComment[]) => void,
) => {
  const commentCollectionRef = collection(
    db,
    `projects/${projectId}/tasks/${taskId}/comments`,
  );
  return onSnapshot(commentCollectionRef, (snapshot) => {
    const taskComments: TaskComment[] = [];
    snapshot.forEach((snap) => {
      const taskComment = snap.data() as TaskComment;
      taskComment.id = snap.id;
      taskComments.push(taskComment);
    });
    callback(taskComments);
  });
};

export const updateTaskComment = (
  projectId: string,
  taskId: string,
  commentId: string,
  comment: string,
) => {
  const taskCommentRef = doc(
    db,
    `projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
  );

  return updateDoc(taskCommentRef, { comment } as Partial<TaskComment>);
};

export const deleteTaskComment = (
  projectId: string,
  taskId: string,
  commentId: string,
) => {
  const taskCommentRef = doc(
    db,
    `projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
  );
  return deleteDoc(taskCommentRef);
};
