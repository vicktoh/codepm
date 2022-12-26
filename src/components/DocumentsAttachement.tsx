import {
  Flex,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Progress,
  Text,
  useToast,
  VisuallyHidden,
  VStack,
} from "@chakra-ui/react";
import { FirebaseError } from "firebase/app";
import { useFormikContext } from "formik";
import React, { ChangeEvent, FC, useState } from "react";
import { BsPlus } from "react-icons/bs";
import { useAppSelector } from "../reducers/types";
import {
  updateFirebaseDoc,
  uploadDocumentToFirebase,
} from "../services/projectServices";
import { ProjectDocument } from "../types/Project";
type DocumentsAttachementsProps = {
  storagePath: string;
};
export const DocumentsAttachements: FC<DocumentsAttachementsProps> = ({
  storagePath,
}) => {
  const { auth } = useAppSelector(({ auth }) => ({
    auth,
  }));
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();

  const { setFieldValue, values } = useFormikContext<{
    documents: ProjectDocument[];
    id: string;
  }>();
  const saveProject = (obj: any) => {
    const path = `proposals/${values.id}`;
    return updateFirebaseDoc(path, obj);
  };
  const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files?.length) {
      try {
        setLoading(true);
        const path = `${storagePath}-${values?.documents?.length || 0}`;
        uploadDocumentToFirebase(
          path,
          e.target.files[0],
          setProgress,
          (url) => {
            setLoading(false);
            setProgress(0);
            const documents = [...(values.documents || [])];
            documents.push({
              title: `Document ${documents.length + 1}`,
              url,
              addedBy: auth?.displayName || "",
              addedById: auth?.uid || "",
              dateAdded: new Date().getTime(),
            });
            setFieldValue("documents", documents);
            saveProject({ documents });
          },
          (err) => {
            toast({
              title: "Could not Upload file",
              status: "error",
              description: err,
            });
          },
        );
      } catch (error) {
        console.log(error);
        const err = error as FirebaseError;
        toast({
          title: "Could not upload file",
          description: err?.message || "unexpected error",
          status: "error",
        });
      }
    }
  };

  return (
    <Flex direction="column">
      <HStack spacing={3} alignItems="center">
        <Heading fontSize="md">Add New File Attachement 🧷</Heading>
        <IconButton
          as={FormLabel}
          rounded="full"
          size="sm"
          htmlFor="file-input"
          aria-label="Add new file"
          colorScheme="brand"
          icon={<Icon as={BsPlus} />}
        />
        <VisuallyHidden>
          <Input
            name="file-input"
            id="file-input"
            type="file"
            onChange={onSelectFile}
          />
        </VisuallyHidden>
      </HStack>
      {progress && loading ? (
        <VStack width="100%">
          <Progress width="100%" value={progress} />
          <Text fontSize="xs">Uploading file Please wait</Text>
        </VStack>
      ) : null}
    </Flex>
  );
};
