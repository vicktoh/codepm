import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { BudgetItem } from "../types/Project";
import { db } from "./firebase";

export const listenOnBudget = (
  projectId: string,
  callback: (budget: BudgetItem[]) => void,
  errorCallback: (errorMessage: string) => void,
) => {
  console.log(`projects/${projectId}/budget`);
  const budgetCollectionRef = collection(db, `/projects/${projectId}/budget`);

  const unsub = onSnapshot(
    budgetCollectionRef,
    (snapshot) => {
      const budget: BudgetItem[] = [];
      snapshot.forEach((snap) => {
        const bud = snap.data() as BudgetItem;
        console.log(bud);
        bud.id = snap.id;
        budget.push(bud);
      });
      callback(budget);
    },
    (e) => {
      console.log(e);
      errorCallback(e.message);
    },
  );
  return unsub;
};

export const getBudgetItems = async (projectId: string) => {
  const budgetCollection = collection(db, `projects/${projectId}/budget`);
  const snapshot = await getDocs(budgetCollection);
  const budget: BudgetItem[] = [];
  snapshot.forEach((snap) => {
    const bud = snap.data() as BudgetItem;
    bud.id = snap.id;
    budget.push(bud);
  });
  return budget;
};

export const uploadBudgetFromData = async (
  data: (Omit<BudgetItem, "amount"> & { amount: string })[],
  projectId: string,
) => {
  const budgetReference = collection(db, `projects/${projectId}/budget`);
  const projectReference = doc(db, `projects/${projectId}`);
  const batch = writeBatch(db);
  batch.update(projectReference, { budget: true });
  data.forEach((data, i) => {
    const docRef = doc(budgetReference);
    const budgetData: BudgetItem = {
      id: docRef.id,
      code: data?.code || "",
      activity: data?.activity || "",
      description: data?.description || "",
      amount: data?.amount ? parseInt(data.amount.replace(/,/g, ""), 10) : 0,
    };
    batch.set(docRef, budgetData);
  });
  await batch.commit();
};

export const deleteBudgetItem = (budgetId: string, projectId: string) => {
  return deleteDoc(doc(db, `projects/${projectId}/budget/${budgetId}`));
};
export const updateBugetItem = (
  budgetItem: Partial<BudgetItem>,
  projectId: string,
) => {
  const budgetDocument = doc(
    db,
    `projects/${projectId}/budget/${budgetItem.id}`,
  );
  return updateDoc(budgetDocument, budgetItem);
};
