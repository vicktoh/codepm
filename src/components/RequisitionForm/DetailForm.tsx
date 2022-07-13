import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Link,
  Progress,
  Select,
  Text,
  useToast,
  VisuallyHidden,
  VStack,
} from "@chakra-ui/react";
import { useFormikContext } from "formik";
import React, { useState } from "react";
import { BsEye, BsUpload } from "react-icons/bs";
import { MdCancel } from "react-icons/md";
import {
  removeInvoice,
  uploadInvoice,
} from "../../services/requisitionServices";
import {
  RequisitionFormValues,
  RequisitionType,
} from "../../types/Requisition";

export const DetailForm = () => {
  const { values, handleChange, handleBlur, errors, touched, setFieldValue } =
    useFormikContext<RequisitionFormValues>();
  const [file, setFile] = useState<File>();
  const [uploadProgress, setUploadProgress] = useState<number>();
  const [isUploading, setUploading] = useState<boolean>(false);
  const toast = useToast();
  const uploadFile = () => {
    if (!file) return;
    setUploading(true);
    uploadInvoice(
      file,
      setUploadProgress,
      (message) => {
        setUploadProgress(0);
        setUploading(false);
        toast({ title: message, status: "error" });
      },
      (url, name) => {
        setUploading(false);
        setUploadProgress(0);
        const attachements = [...(values.attachments || [])];
        attachements.push({
          title: `invoice ${attachements.length + 1}`,
          fileUrl: url,
          name,
        });
        setFieldValue("attachments", attachements);
        setFile(undefined);
      },
    );
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
    <Flex direction="column" pb={5} px={5}>
      <VStack>
        <Heading fontSize="lg">Requisition Details</Heading>
        <Text>Step of 1 of 3</Text>
      </VStack>
      <FormControl isInvalid={!!touched.title && !!errors.title} mb={5}>
        <FormLabel>Requisition title</FormLabel>
        <Input
          value={values.title}
          onChange={handleChange}
          name="title"
          onBlur={handleBlur}
        />
        <FormErrorMessage>{touched.title && errors.title}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!touched.date && !!errors.date} mb={5}>
        <FormLabel>Date</FormLabel>
        <Input
          value={values.date}
          onChange={handleChange}
          name="date"
          type="date"
          onBlur={handleBlur}
        />
        <FormErrorMessage>{touched.date && errors.date}</FormErrorMessage>
      </FormControl>
      <FormControl mb={5} isInvalid={!!touched.type && !!errors.type}>
        <FormLabel>Requisition Type</FormLabel>
        <Select
          value={values.type}
          onChange={handleChange}
          onBlur={handleBlur}
          name="type"
        >
          <option value="">Select type</option>
          {Object.values(RequisitionType).map((type, i) => (
            <option key={`requisition-type-${i}`} value={type}>
              {type}
            </option>
          ))}
        </Select>
        <FormErrorMessage>{touched.type && errors.type}</FormErrorMessage>
      </FormControl>
      <Flex direction="column" mb={5}>
        <Heading mb={3} fontSize="md">
          Invoices
        </Heading>
        <HStack alignItems="center" width="100%">
          <VStack minWidth="50%" justifyContent="center">
            <Text
              width="100%"
              textAlign="center"
              py={1}
              borderRadius="lg"
              as={FormLabel}
              htmlFor="file-input"
              bg="gray.200"
              isTruncated
              noOfLines={1}
            >
              {file?.name || "SelectFile"}
            </Text>
            <VisuallyHidden>
              <Input
                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
                type="file"
                id="file-input"
              />
            </VisuallyHidden>
          </VStack>
          <Button
            disabled={!!!file || isUploading}
            onClick={uploadFile}
            variant="outline"
            colorScheme="brand"
            size="sm"
            leftIcon={<Icon as={BsUpload} />}
          >
            Upload
          </Button>
        </HStack>
        {uploadProgress ? (
          <Progress width="100%" value={uploadProgress} />
        ) : null}
        <HStack flexWrap="wrap">
          {values.attachments?.length ? (
            values.attachments.map((attachment, i) => (
              <HStack key={"invoice-${i"} shadow={2} bg="gray.50" p={2} my={2}>
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
            ))
          ) : (
            <Text alignSelf="center" color="gray.300">
              No Invoices Added Yet
            </Text>
          )}
        </HStack>
      </Flex>
      <Button
        disabled={!!!values.title || !!!values.type || !!!values.date}
        colorScheme="brand"
        onClick={() => setFieldValue("step", 2)}
        alignSelf="end"
      >
        Next
      </Button>
    </Flex>
  );
};
