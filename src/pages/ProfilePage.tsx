import { Avatar, Box, Button, CircularProgress, Flex, FormLabel, Heading, Icon, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, useDisclosure, useToast, VisuallyHidden, VStack } from '@chakra-ui/react';
import { updateProfile } from 'firebase/auth';
import React, { FC, useEffect, useState } from 'react';
import { BsPencil } from 'react-icons/bs';
import { useDispatch } from 'react-redux';
import { ImageCropper } from '../components/ImageCropper';
import { ProfileForm } from '../components/ProfileForm';
import { updateAuth } from '../reducers/authSlice';
import { useAppSelector } from '../reducers/types';
import { firebaseAuth } from '../services/firebase';
import { updatePhotoUrl, uploadProfilePic } from '../services/profileServices';

export const ProfilePage: FC = () => {
    const { profile, auth } = useAppSelector(({ profile, auth }) => ({
        profile,
        auth,
    }));
    const {isOpen: isProfileModalOpen, onClose: onCloseProfileModal, onOpen: onOpenProfileModal} = useDisclosure();
    const {isOpen: isAvartaModalOpen, onClose: onCloseAvartarModal, onOpen: onOpenAvatarModal} = useDisclosure();
    const [imageSrc, setImageSrc] = useState<string>();
    const [croppedBlob, setCroppedBlob] = useState<Blob>();
    const [uploadingProfilePic, setUploadingProfilePic] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const toast = useToast();
    const dispatch = useDispatch();


    useEffect(()=> {
       function uploadProfile(){
          
          if(croppedBlob && auth?.uid){
            setUploadingProfilePic(true);
            console.log({croppedBlob});
             uploadProfilePic(auth?.uid, croppedBlob, (e)=> {
                toast({title: "Error Uploading Image", description: e, status: "error"});
                setUploadingProfilePic(false);
             }, setProgress, async (url)=> {
                await updatePhotoUrl(auth.uid, url);
                firebaseAuth.currentUser && await updateProfile(firebaseAuth.currentUser, {photoURL: url} );
                setUploadingProfilePic(false);
                dispatch(updateAuth({photoUrl: url}))
             })
          }
       }
       uploadProfile();
    }, [croppedBlob,auth?.uid, toast, dispatch]);

    const onFileChange = (e:React.ChangeEvent<HTMLInputElement> ) =>{
      let file = e.target.files  ? e.target.files[0]: null;
      if(!file) return;
      let blob = URL.createObjectURL(file);
      setImageSrc(blob);
      onOpenAvatarModal();
  }
    return (
        <Flex width="100%" direction="column" py={5}>
            <Heading>Profile Page</Heading>
            <Flex
                px={5}
                border="1px solid white"
                mt={5}
                background="rgba(255, 255, 255, .32)"
                borderRadius={['none', '2xl']}
                backdropFilter="blur(5.8px)"
                boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
                direction="column"
                alignItems="flex-start"
                pb={5}
            >
                <VStack spacing={2} mt={5}>
                    <Heading fontSize="md">
                        {auth?.displayName || 'Unknow User name'}
                    </Heading>
                    <Box position="relative" >
                       <VisuallyHidden>
                          <Input type="file" onChange={onFileChange} id="fileInput" />
                       </VisuallyHidden>
                        <Avatar
                            name={auth?.displayName}
                            src={profile?.photoUrl || auth?.photoUrl || ''}
                            size="xl"
                        />
                        {
                           uploadingProfilePic ?
                           <CircularProgress color='brand.300' top="-2px" left="-2px" position="absolute" value={progress} thickness="6px" size="100px" />:
                           <IconButton
                            size="xs"
                            position="absolute"
                            right={0}
                            bottom={0}
                            icon={<Icon as={BsPencil} />}
                            aria-label="edit button"
                            as ={FormLabel} htmlFor="fileInput"
                        />
                        }
                        
                    </Box>
                </VStack>
                <VStack spacing={2} mt={5}  alignItems="flex-start">
                    <Box mb={3}>
                        <Text>Designation</Text>
                        <Heading fontSize="md">
                            {profile?.designation || 'None'}
                        </Heading>
                    </Box>
                    <Box mb={3}>
                        <Text>Date of Birth</Text>
                        <Heading fontSize="md">
                            {profile?.dateOfBirth || 'None'}
                        </Heading>
                    </Box>
                    <Box mb={3}>
                        <Text>Phone Number</Text>
                        <Heading fontSize="md">
                            {profile?.phoneNumber || 'None'}
                        </Heading>
                    </Box>
                    <Box mb={3}>
                        <Text>Departments</Text>
                        <Heading fontSize="md">
                            {profile?.department || 'None'}
                        </Heading>
                    </Box>
                </VStack>
                <Button onClick={onOpenProfileModal} size="sm" mt={5} variant="outline" colorScheme="brand" borderWidth={1} bg="white">Edit Profile</Button>
            </Flex>
            <Modal isOpen={isProfileModalOpen} onClose={onCloseProfileModal} size = "md">
               <ModalOverlay />
               <ModalContent>
                  <ModalHeader>Edit Profile</ModalHeader>
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
                     <ImageCropper src = {imageSrc || ""} setInput = {setCroppedBlob} onClose = {onCloseAvartarModal}  />
                  </ModalBody>
               </ModalContent>
            </Modal>
        </Flex>
    );
};
