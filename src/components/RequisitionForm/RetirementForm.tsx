import { Text } from "@chakra-ui/react";
import React from "react";

export const RetirementForm = () => {
  //    const [file, setFile] = useState<File>();
  //   const toast = useToast();
  //   const uploadFile = () => {
  //     if (!file) return;
  //     setUploading(true);
  //     uploadInvoice(
  //       file,
  //       setUploadProgress,
  //       (message) => {
  //         setUploadProgress(0);
  //         setUploading(false);
  //         toast({ title: message, status: "error" });
  //       },
  //       (url, name) => {
  //         setUploading(false);
  //         setUploadProgress(0);
  //         const attachements = [...(values.attachments || [])];
  //         attachements.push({
  //           title: `invoice ${attachements.length + 1}`,
  //           fileUrl: url,
  //           name,
  //         });
  //         setFieldValue("attachments", attachements);
  //         setFile(undefined);
  //       },
  //     );
  //   };
  //   const removeFile = async (i: number) => {
  //     if (!values.attachments?.length) return;
  //     const attachment = values.attachments[i];
  //     try {
  //       await removeInvoice(attachment.name || "");
  //       const attachements = [...values.attachments];
  //       attachements.splice(i, 1);
  //       setFieldValue("attachments", attachements);
  //     } catch (error) {
  //       const err: any = error;
  //       toast({
  //         title: "Could not delete file",
  //         status: "error",
  //         description: err?.message,
  //       });
  //     }
  //   };
  return (
    <Text>Hello ther</Text>
    //  <Flex direction="column" mb={5}>
    //    <Heading mb={3} fontSize="md">
    //      Invoices
    //    </Heading>
    //    <HStack alignItems="center" width="100%">
    //      <VStack minWidth="50%" justifyContent="center">
    //        <Text
    //          width="100%"
    //          textAlign="center"
    //          py={1}
    //          borderRadius="lg"
    //          as={FormLabel}
    //          htmlFor="file-input"
    //          bg="gray.200"
    //          isTruncated
    //          noOfLines={1}
    //        >
    //          {file?.name || "SelectFile"}
    //        </Text>
    //        <VisuallyHidden>
    //          <Input
    //            accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
    //            onChange={(e) => e.target.files && setFile(e.target.files[0])}
    //            type="file"
    //            id="file-input"
    //          />
    //        </VisuallyHidden>
    //      </VStack>
    //      <Button
    //        disabled={!!!file || isUploading}
    //        onClick={uploadFile}
    //        variant="outline"
    //        colorScheme="brand"
    //        size="sm"
    //        leftIcon={<Icon as={BsUpload} />}
    //      >
    //        Upload
    //      </Button>
    //    </HStack>
    //    {uploadProgress ? <Progress width="100%" value={uploadProgress} /> : null}
    //    <HStack flexWrap="wrap">
    //      {values.attachments?.length ? (
    //        values.attachments.map((attachment, i) => (
    //          <HStack key={"invoice-${i"} shadow={2} bg="gray.50" p={2} my={2}>
    //            <Input
    //              size="xs"
    //              name={`attachments.${i}.title`}
    //              value={attachment.title}
    //              onChange={handleChange}
    //              onBlur={handleBlur}
    //            />
    //            <IconButton
    //              as={Link}
    //              href={attachment.fileUrl}
    //              isExternal
    //              size="xs"
    //              aria-label="view invoice"
    //              icon={<Icon color="blue.200" as={BsEye} />}
    //            />
    //            <IconButton
    //              onClick={() => removeFile(i)}
    //              size="xs"
    //              aria-label="remove invoice"
    //              icon={<Icon color="red.300" as={MdCancel} />}
    //            />
    //          </HStack>
    //        ))
    //      ) : (
    //        <Text alignSelf="center" color="gray.300">
    //          No Invoices Added Yet
    //        </Text>
    //      )}
    //    </HStack>
    //  </Flex>
  );
};
