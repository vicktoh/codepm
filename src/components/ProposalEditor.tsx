import {
  Flex,
  FormControl,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Link,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  Tooltip,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Formik } from "formik";
import React, { FC, useState } from "react";
import { BsEye, BsLink, BsPencil } from "react-icons/bs";
import { FaSave } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { useAppSelector } from "../reducers/types";
import { updateFirebaseDoc } from "../services/projectServices";
import { removeDocument } from "../services/requisitionServices";
import { Document, ProjectDocument } from "../types/Project";
import { ProposalType, STATUSES } from "../types/ProposalType";
import { DocumentPopover } from "./DocumentPopover";
import { DocumentsAttachements } from "./DocumentsAttachement";
type ProposalEditorProps = {
  proposal: ProposalType;
};
export const ProposalEditor: FC<ProposalEditorProps> = ({ proposal }) => {
  const { auth, users } = useAppSelector(({ auth, users }) => ({
    auth,
    users,
  }));
  const { usersMap = {} } = users || {};
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const toast = useToast();
  const saveProject = (object: Partial<ProposalType>) => {
    const path = `proposals/${object?.id || ""}`;
    return updateFirebaseDoc(path, { ...object });
  };

  const addDocument = (
    document: Document,
    documents: ProjectDocument[],
    setField: (key: string, data: any) => void,
  ) => {
    const doc: ProjectDocument = {
      ...document,
      addedBy: auth?.displayName || "",
      addedById: auth?.uid || "",
      dateAdded: new Date().getTime(),
    };
    setField("documents", [...(documents || []), doc]);
    saveProject({ id: proposal.id, documents: [...(documents || []), doc] });
  };

  const removeFile = async (
    i: number,
    documents: ProjectDocument[],
    setFieldValue: (key: string, data: any) => void,
  ) => {
    const storagePath = `proposals/${proposal.id}`;
    if (!documents?.length) return;
    try {
      const docs = [...documents];
      docs.splice(i, 1);
      setFieldValue("documents", docs);
      await saveProject({ id: proposal.id, documents: docs });
      const path = `${storagePath}-${i}`;
      await removeDocument(path);
    } catch (error) {
      const err: any = error;
      toast({
        title: "Could not delete file",
        status: "warning",
        description: err?.message,
      });
    }
  };
  return (
    <Formik
      initialValues={proposal}
      onSubmit={async (values) => {
        try {
          const path = `proposals/${values.id}`;
          await updateFirebaseDoc(path, values);
          setShowEdit(false);
        } catch (error) {
          const err: any = error;
          toast({
            title: "could not save changes",
            status: "error",
            description: err?.message || "Something went wrong",
          });
        }
      }}
    >
      {({
        values,
        handleBlur,
        handleChange,
        setFieldValue,
        submitForm,
        isSubmitting,
      }) => (
        <Flex
          direction="column"
          px={5}
          py={10}
          width="100%"
          position="relative"
        >
          {showEdit ? (
            <IconButton
              aria-label="save title"
              icon={<FaSave />}
              onClick={submitForm}
              type="submit"
              isLoading={isSubmitting}
              size="sm"
              top={5}
              right={5}
              position="absolute"
            />
          ) : (
            <IconButton
              icon={<BsPencil />}
              onClick={() => setShowEdit(true)}
              size="sm"
              aria-label="edit title"
              top={5}
              right={5}
              position="absolute"
            />
          )}
          <Flex direction="column" justifyContent="space-between" mb={3}>
            <Heading fontSize="md">Title</Heading>
            {showEdit ? (
              <Input
                name="title"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.title}
              />
            ) : (
              <Heading fontSize="2xl">{values.title}</Heading>
            )}
          </Flex>
          <FormControl mb={3}>
            <Heading fontSize="md">Description</Heading>
            {showEdit ? (
              <Textarea
                name="description"
                onChange={handleChange}
                value={values.description}
              />
            ) : (
              <Text>{values.description}</Text>
            )}
          </FormControl>
          <SimpleGrid columns={2} mb={3} gap={5}>
            <FormControl>
              <Heading fontSize="md">Funder</Heading>
              {showEdit ? (
                <Input
                  onChange={handleChange}
                  value={values.funder}
                  name="funder"
                  onBlur={handleBlur}
                />
              ) : (
                <Text>{values.funder}</Text>
              )}
            </FormControl>
            <FormControl>
              <Heading fontSize="md">Status</Heading>
              {showEdit ? (
                <Select
                  onChange={handleChange}
                  value={values.status}
                  name="status"
                  onBlur={handleBlur}
                >
                  {STATUSES.map((value) => (
                    <option value={value} key={`proposal-status-{value}`}>
                      {value}
                    </option>
                  ))}
                </Select>
              ) : (
                <Text>{values.status}</Text>
              )}
            </FormControl>
          </SimpleGrid>
          <Flex direction="column" mb={3}>
            <HStack spacing={4} alignItems="center">
              <DocumentsAttachements storagePath={`proposals/${proposal.id}`} />
              <DocumentPopover
                onSubmit={(document) =>
                  addDocument(document, values?.documents || [], setFieldValue)
                }
              >
                <IconButton
                  size="sm"
                  borderRadius="full"
                  aria-label="upload from file"
                  icon={<BsLink />}
                  colorScheme="brand"
                />
              </DocumentPopover>
            </HStack>
            <Heading fontSize="sm" mt={5}>
              Documents
            </Heading>
            <HStack flexWrap="wrap">
              {values.documents?.length ? (
                values.documents.map((attachment, i) => (
                  <VStack
                    key={`invoice-${i}`}
                    shadow={2}
                    p={2}
                    my={2}
                    borderColor="brand.300"
                    borderWidth={1}
                    borderRadius="lg"
                  >
                    <HStack>
                      <Input
                        size="xs"
                        name={`documents.${i}.title`}
                        value={attachment.title}
                        readOnly={auth?.uid !== attachment.addedById}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <Tooltip label="view this attachment" size="sm">
                        <IconButton
                          as={Link}
                          href={attachment.url}
                          isExternal
                          size="xs"
                          aria-label="view invoice"
                          icon={<Icon color="blue.200" as={BsEye} />}
                        />
                      </Tooltip>
                      <Tooltip label="delete this attachment" size="sm">
                        <IconButton
                          disabled={auth?.uid !== attachment.addedById}
                          onClick={() =>
                            removeFile(i, values.documents, setFieldValue)
                          }
                          size="xs"
                          aria-label="remove invoice"
                          icon={<Icon color="red.300" as={MdCancel} />}
                        />
                      </Tooltip>
                    </HStack>
                    <Text fontSize="xs">{`Uploaded by ${
                      usersMap[attachment.addedById]?.displayName || "N/A"
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
        </Flex>
      )}
    </Formik>
  );
};
