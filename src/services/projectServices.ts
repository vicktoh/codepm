import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Project, ProjectDocument, Task } from "../types/Project";
import { ProposalType } from "../types/ProposalType";
import { db, firebaseApp } from "./firebase";

export const listenOnProposals = (
  onSuccessCallback: (data: ProposalType[]) => void,
) => {
  const collectionRef = collection(db, "proposals");

  return onSnapshot(collectionRef, (snapshot) => {
    const proposals: ProposalType[] = [];
    snapshot.forEach((snap) => {
      const proposal = snap.data() as ProposalType;
      proposal.id = snap.id;
      proposal.dateAdded = (proposal.dateAdded as Timestamp).toDate();
      proposals.push(proposal);
    });
    onSuccessCallback(proposals);
  });
};

export const addProposal = async (proposal: ProposalType, authId: string) => {
  const proposalCollectionRef = collection(db, "proposals");
  const docRef = doc(proposalCollectionRef);
  const proposalData: ProposalType = {
    creatorId: authId,
    title: proposal.title,
    description: proposal.description,
    dateAdded: Timestamp.now(),
    status: proposal.status,
    funder: proposal.funder,
    documents: proposal?.documents || [],
  };
  await setDoc(docRef, proposalData);
};

export const editProposal = async (
  proposal: ProposalType & { file?: File },
) => {
  if (!proposal.id) return;
  const proposalData: Partial<ProposalType> = {
    title: proposal.title,
    description: proposal.description,
    status: proposal.status,
    funder: proposal.funder,
  };
  const docRef = doc(db, `proposals/${proposal.id}`);
  if (!proposal.file) {
    await updateDoc(docRef, proposalData);
  } else {
    await updateDoc(docRef, proposalData);
  }
};

export const updateFirebaseDoc = (path: string, obj: Record<string, any>) => {
  const docRef = doc(db, path);
  return updateDoc(docRef, { ...obj });
};

export const deleteProposal = async (proposal: ProposalType) => {
  if (!proposal.id) return;
  const docRef = doc(db, `proposals/${proposal.id}`);
  const storage = getStorage(firebaseApp);
  const storageRef = ref(storage, `proposals/${proposal.id}`);
  await deleteDoc(docRef);
  await deleteObject(storageRef);
};

// projects

export const listenOnProjects = (callback: (data: Project[]) => void) => {
  const collectionRef = collection(db, "projects");
  return onSnapshot(collectionRef, (projectSnapshot) => {
    const projects: Project[] = [];
    projectSnapshot.forEach((snapshot) => {
      const project = snapshot.data() as Project;
      project.dateAdded = (project.dateAdded as Timestamp).toDate();
      project.id = snapshot.id;
      projects.push(project);
    });
    callback(projects);
  });
};

export const getProjects = async () => {
  const collectionRef = collection(db, "projects");
  const snapshot = await getDocs(collectionRef);
  const data: Project[] = [];
  snapshot.forEach((snap) => {
    const project = snap.data() as Project;
    project.id = snap.id;
    data.push(project);
  });
  return data;
};

export const deleteProject = async (project: Project) => {
  const docRef = doc(db, `projects/${project.id}`);
  await deleteDoc(docRef);

  // Todo Clean up cloud function to remove residue of workplans and documents in storage
};

export const addProject = async (
  project: Omit<Project, "id" | "dateAdded">,
  userId: string,
) => {
  const projectCollection = collection(db, "projects");
  const projectRef = doc(projectCollection);
  const projectToAdd: Project = {
    id: projectRef.id,
    ...project,
    dateAdded: Timestamp.now(),
    creatorId: userId,
  };

  await setDoc(projectRef, projectToAdd);
  return projectRef.id;
};

export const editProject = async (project: Partial<Project>) => {
  if (!project.id) return;
  const projectRef = doc(db, `projects/${project.id}`);
  await updateDoc(projectRef, { ...project });
};
export const getProject = async (projectId: string) => {
  const docRef = doc(db, `projects/${projectId}`);
  const docSnapshot = await getDoc(docRef);
  const project = docSnapshot.data() as Project;
  project.id = docSnapshot.id;
  project.dateAdded = (project.dateAdded as Timestamp).toDate();
  return project;
};

export const addDocument = async (
  newdoc: ProjectDocument,
  project: Project,
) => {
  const documents: ProjectDocument[] = [...(project?.documents || []), newdoc];
  const documentRef = doc(db, `projects/${project.id}`);
  await updateDoc(documentRef, { documents });

  return { ...project, documents };
};
export const editDocument = async (
  documents: ProjectDocument[],
  project: Project,
) => {
  const documentRef = doc(db, `projects/${project.id}`);
  await updateDoc(documentRef, { documents });
};

export const updateProject = async (projectId: string, update: any) => {
  const documentRef = doc(db, `projects/${projectId}`);
  await updateDoc(documentRef, update);
};
export const updateProposal = async (
  proposalId: string,
  update: ProposalType,
) => {
  const documentRef = doc(db, `proposals/${proposalId}`);
  await updateDoc(documentRef, update);
};
export const uploadDocumentToFirebase = (
  path: string,
  file: File,
  setProgress: (per: number) => void,
  success: (url: string) => void,
  onError: (errorMessage: string) => void,
) => {
  const storage = getStorage(firebaseApp);
  const storageRef = ref(storage, `${path}`);
  const uploadTask = uploadBytesResumable(storageRef, file);
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setProgress(progress);
    },
    (error) => {
      onError(error?.message || "");
    },
    async () => {
      const url = await getDownloadURL(uploadTask.snapshot.ref);
      success(url);
    },
  );
};

export const listenOnTasks = (
  projectId: string | undefined,
  workplanId: string | undefined,
  callback: (data: Task[]) => void,
) => {
  if (!projectId || !workplanId) return;
  const collectionRef = collection(db, `projects/${projectId}/tasks`);
  const q = query(
    collectionRef,
    where("workplanId", "==", workplanId),
    orderBy("timestamp", "desc"),
  );
  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = [];
    snapshot.forEach((snap) => {
      const task = snap.data() as Task;
      task.id = snap.id;
      tasks.push(task);
    });

    callback(tasks);
  });
};
