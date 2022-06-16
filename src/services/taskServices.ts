import { collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { Task } from "../types/Project";
import { db } from "./firebase";




export const addTaskToDb = async (projectId: string, task: Task) => {
   const collectionRef = collection(db, `projects/${projectId}/tasks`);
   const docRef = doc(collectionRef);
   task.id = docRef.id;
   return setDoc(docRef, task);
}

export const updateDbTask  = async (projectId: string, taskId: string, change: any) => {
   const docRef = doc(db, `projects/${projectId}/tasks/${taskId}`);
   await updateDoc(docRef, change);
}