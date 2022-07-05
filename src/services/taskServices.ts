import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { Task } from "../types/Project";
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
