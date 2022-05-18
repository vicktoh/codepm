import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    setDoc,
    Timestamp,
    updateDoc,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { ProposalType } from '../types/ProposalType';
import { db, firebaseApp } from './firebase';

export const listenOnProposals = (
    onSuccessCallback: (data: ProposalType[]) => void
) => {
    const collectionRef = collection(db, 'proposals');

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

export const addProposal = async (proposal: ProposalType & { file?: File }) => {
    if (!proposal.file) return;
    const storage = getStorage(firebaseApp);
    const proposalCollectionRef = collection(db, 'proposals');
    const docRef = doc(proposalCollectionRef);
    const storageRef = ref(storage, `proposals/${docRef.id}`);
    const uploadTask = await uploadBytes(storageRef, proposal.file);
    const url = await getDownloadURL(uploadTask.ref);
    const proposalData: ProposalType = {
        title: proposal.title,
        description: proposal.description,
        dateAdded: Timestamp.now(),
        status: proposal.status,
        funder: proposal.funder,
        fileUrl: url,
    };
    await setDoc(docRef, proposalData);
};

export const editProposal = async (
    proposal: ProposalType & { file?: File }
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
        const storage = getStorage(firebaseApp);
        const storageRef = ref(storage, `proposals/${proposal.id}`);
        const uploadTask = await uploadBytes(storageRef, proposal.file);
        const url = await getDownloadURL(uploadTask.ref);
        proposalData.fileUrl = url;
        await updateDoc(docRef, proposalData);
    }
};


export const deleteProposal = async (proposal: ProposalType) => {
    if (!proposal.id) return;
    const docRef = doc(db, `proposals/${proposal.id}`);
    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, `proposals/${proposal.id}`);
    await deleteDoc(docRef);
    await deleteObject(storageRef);
};
