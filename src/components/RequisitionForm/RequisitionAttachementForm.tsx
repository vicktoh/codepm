import {
  Flex,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Link,
  Progress,
  Text,
  useToast,
  VisuallyHidden,
  VStack,
} from "@chakra-ui/react";
import { FirebaseError } from "firebase/app";
import { useFormikContext } from "formik";
import React, { ChangeEvent, useState } from "react";
import { BsEye, BsPlus } from "react-icons/bs";
import { MdCancel } from "react-icons/md";
import { useGlassEffect } from "../../hooks/useLoadingAnimation";
import { useAppSelector } from "../../reducers/types";
import {
  removeInvoice,
  uploadInvoice,
} from "../../services/requisitionServices";
import { Requisition } from "../../types/Requisition";

export const RequisitionAttachmentForm = () => {
  const { auth, users } = useAppSelector(({ auth, users }) => ({
    auth,
    users,
  }));
  const { usersMap = {} } = users || {};
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();
  const { setFieldValue, values, handleChange, handleBlur } = useFormikContext<{
    attachments?: Requisition["attachments"];
  }>();
  const glassEffect = useGlassEffect(true, "lg");
  const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files?.length) {
      try {
        setLoading(true);
        uploadInvoice(
          e.target.files[0],
          setProgress,
          (err) => {
            toast({
              title: "Could not Upload file",
              status: "error",
              description: err,
            });
          },
          (url, name) => {
            setLoading(false);
            setProgress(0);
            const attachements = [...(values.attachments || [])];
            attachements.push({
              title: `Invoice ${attachements.length + 1}`,
              fileUrl: url,
              name,
              uploaderId: auth?.uid || "",
            });
            setFieldValue("attachments", attachements);
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
  const removeFile = async (i: number) => {
    if (!values.attachments?.length) return;
    const attachment = values.attachments[i];
    try {
      await removeInvoice(attachment.name || "");
      const attachements = [...values.attachments];
      attachements.splice(i, 1);
      setFieldValue("attachments", attachements);
    } catch (error) {
      const err: any = error;
      toast({
        title: "Could not delete file",
        status: "error",
        description: err?.message,
      });
    }
  };
  return (
    <Flex direction="column" mt={5}>
      <HStack spacing={3}>
        <Heading fontSize="">Add New File Attachement 🧷</Heading>
        <IconButton
          as={FormLabel}
          rounded="full"
          htmlFor="file-input"
          aria-label="Add new file"
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
      <HStack flexWrap="wrap">
        {values.attachments?.length ? (
          values.attachments.map((attachment, i) => (
            <VStack
              {...glassEffect}
              key={"invoice-${i"}
              shadow={2}
              p={2}
              my={2}
            >
              <HStack>
                <Input
                  size="xs"
                  name={`attachments.${i}.title`}
                  value={attachment.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <IconButton
                  as={Link}
                  href={attachment.fileUrl}
                  isExternal
                  size="xs"
                  aria-label="view invoice"
                  icon={<Icon color="blue.200" as={BsEye} />}
                />
                <IconButton
                  onClick={() => removeFile(i)}
                  size="xs"
                  aria-label="remove invoice"
                  icon={<Icon color="red.300" as={MdCancel} />}
                />
              </HStack>
              <Text fontSize="xs">{`Uploaded by ${
                usersMap[attachment.uploaderId]?.displayName || "N/A"
              }`}</Text>
            </VStack>
          ))
        ) : (
          <Text alignSelf="center" color="gray.300">
            No Invoices Added Yet
          </Text>
        )}
      </HStack>
    </Flex>
  );
};
