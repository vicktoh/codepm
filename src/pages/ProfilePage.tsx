import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Flex,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
  VisuallyHidden,
  VStack,
} from "@chakra-ui/react";
import { updateProfile } from "firebase/auth";
import React, { FC, useEffect, useState, useRef } from "react";
import { BsPencil } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { ImageCropper } from "../components/ImageCropper";
import { ProfileForm } from "../components/ProfileForm";
import { updateAuth } from "../reducers/authSlice";
import { useAppSelector } from "../reducers/types";
import { firebaseAuth } from "../services/firebase";
import {
  updatePhotoUrl,
  updateSignatureUrl,
  uploadProfilePic,
  uploadSignature,
} from "../services/profileServices";

export const ProfilePage: FC = () => {
  const { profile, auth } = useAppSelector(({ profile, auth }) => ({
    profile,
    auth,
  }));
  const {
    isOpen: isProfileModalOpen,
    onClose: onCloseProfileModal,
    onOpen: onOpenProfileModal,
  } = useDisclosure();
  const {
    isOpen: isAvartaModalOpen,
    onClose: onCloseAvartarModal,
    onOpen: onOpenAvatarModal,
  } = useDisclosure();
  const {
    isOpen: isSignatureModalOpen,
    onClose: onCloseSignatureModal,
    onOpen: onOpenSignatureModal,
  } = useDisclosure();
  const [imageSrc, setImageSrc] = useState<string>();
  const [signatureSrc, setSignatureSrc] = useState<string>();
  const [croppedBlob, setCroppedBlob] = useState<Blob>();
  const [croppedSigBlob, setCroppedSigBlob] = useState<Blob>();
  const [uploadingProfilePic, setUploadingProfilePic] =
    useState<boolean>(false);
  const [uploadingSignature, setUploadingSignature] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [sigProgress, setSigProgress] = useState<number>(0);
  const [fileInput, setFileInput] = useState<File>();
  const toast = useToast();
  const dispatch = useDispatch();
  const sigRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    function uploadProfile() {
      if (croppedBlob && auth?.uid) {
        setUploadingProfilePic(true);
        console.log({ croppedBlob });
        uploadProfilePic(
          auth?.uid,
          croppedBlob,
          (e) => {
            toast({
              title: "Error Uploading Image",
              description: e,
              status: "error",
            });
            setUploadingProfilePic(false);
          },
          setProgress,
          async (url) => {
            await updatePhotoUrl(auth.uid, url);
            firebaseAuth.currentUser &&
              (await updateProfile(firebaseAuth.currentUser, {
                photoURL: url,
              }));
            setUploadingProfilePic(false);
            dispatch(updateAuth({ photoUrl: url }));
          },
        );
      }
    }
    uploadProfile();
  }, [croppedBlob, auth?.uid, toast, dispatch]);
  useEffect(() => {
    function uploadSignatureFile() {
      if (croppedSigBlob && auth?.uid) {
        setUploadingSignature(true);
        console.log({ croppedSigBlob });
        uploadSignature(
          auth?.uid,
          croppedSigBlob,
          (e) => {
            toast({
              title: "Error Uploading Image",
              description: e,
              status: "error",
            });
            setUploadingSignature(false);
          },
          setSigProgress,
          async (url) => {
            await updateSignatureUrl(auth.uid, url);
            setUploadingSignature(false);
          },
        );
      }
    }
    uploadSignatureFile();
  }, [croppedSigBlob, auth?.uid, toast, dispatch]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;
    if (file.type.split("/")[0] !== "image") {
      toast({ title: "only Image files are allowed", status: "error" });
      return;
    }
    setFileInput(file);
    const blob = URL.createObjectURL(file);
    setImageSrc(blob);
    onOpenAvatarModal();
  };
  const onInputClick = () => {
    if (sigRef.current?.value) {
      sigRef.current.value = "";
    }
  };
  const onSigFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;
    if (file.type.split("/")[0] !== "image") {
      toast({ title: "only Image files are allowed", status: "error" });
      return;
    }
    const blob = URL.createObjectURL(file);
    setSignatureSrc(blob);
    onOpenSignatureModal();
  };
  return (
    <Flex width="100%" direction="column" py={5}>
      <Heading>Profile Page</Heading>
      <Flex
        px={5}
        border="1px solid white"
        mt={5}
        background="rgba(255, 255, 255, .32)"
        borderRadius={["none", "2xl"]}
        backdropFilter="blur(5.8px)"
        boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
        direction="column"
        alignItems="flex-start"
        pb={5}
      >
        <VStack spacing={2} mt={5}>
          <Heading fontSize="md">
            {auth?.displayName || "Unknow User name"}
          </Heading>
          <Box position="relative">
            <VisuallyHidden>
              <Input
                type="file"
                // value={fileInput?.name}
                onChange={onFileChange}
                id="fileInput"
              />
            </VisuallyHidden>
            <Avatar
              name={auth?.displayName}
              src={profile?.photoUrl || auth?.photoUrl || ""}
              size="xl"
            />
            {uploadingProfilePic ? (
              <CircularProgress
                color="brand.300"
                top="-2px"
                left="-2px"
                position="absolute"
                value={progress}
                thickness="6px"
                size="100px"
              />
            ) : (
              <IconButton
                size="xs"
                position="absolute"
                right={0}
                bottom={0}
                icon={<Icon as={BsPencil} />}
                aria-label="edit button"
                as={FormLabel}
                htmlFor="fileInput"
              />
            )}
          </Box>
        </VStack>
        <VStack spacing={2} mt={5} alignItems="flex-start">
          <Box mb={3}>
            <Text>Designation</Text>
            <Heading fontSize="md">{profile?.designation || "None"}</Heading>
          </Box>
          <Box mb={3}>
            <Text>Date of Birth</Text>
            <Heading fontSize="md">{profile?.dateOfBirth || "None"}</Heading>
          </Box>
          <Box mb={3}>
            <Text>Phone Number</Text>
            <Heading fontSize="md">{profile?.phoneNumber || "None"}</Heading>
          </Box>
          <Box mb={3}>
            <Text>Departments</Text>
            <Heading fontSize="md">{profile?.department || "None"}</Heading>
          </Box>
        </VStack>
        <Box position="relative" mt={5}>
          <Heading fontSize="sm">Signature</Heading>
          <VisuallyHidden>
            <Input
              onClick={(e) => onInputClick()}
              ref={sigRef}
              // value={fileInput?.name}
              type="file"
              onChange={onSigFileChange}
              id="sigFileInput"
            />
          </VisuallyHidden>
          <Avatar src={profile?.signatureUrl || ""} size="md" />
          {uploadingSignature ? (
            <CircularProgress
              color="brand.300"
              top="-2px"
              left="-2px"
              position="absolute"
              value={sigProgress}
              thickness="6px"
              size="30px"
            />
          ) : (
            <IconButton
              size="xs"
              position="absolute"
              right={0}
              bottom={0}
              icon={<Icon as={BsPencil} />}
              aria-label="edit button"
              as={FormLabel}
              htmlFor="sigFileInput"
            />
          )}
        </Box>
        <Button
          onClick={onOpenProfileModal}
          size="sm"
          mt={5}
          variant="outline"
          colorScheme="brand"
          borderWidth={1}
          bg="white"
        >
          Edit Profile
        </Button>
      </Flex>
      <Modal
        isOpen={isProfileModalOpen}
        onClose={onCloseProfileModal}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ProfileForm onClose={onCloseProfileModal} />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isAvartaModalOpen} onClose={onCloseAvartarModal} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <ImageCropper
              src={imageSrc || ""}
              setInput={setCroppedBlob}
              onClose={onCloseAvartarModal}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isSignatureModalOpen}
        onClose={onCloseSignatureModal}
        size="sm"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <ImageCropper
              src={signatureSrc || ""}
              setInput={setCroppedSigBlob}
              onClose={() => {
                setFileInput(undefined);
                onCloseSignatureModal();
              }}
              aspect={5 / 3}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
