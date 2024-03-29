import {
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  Text,
  Flex,
  useToast,
} from "@chakra-ui/react";
import React, { FC } from "react";
import { FcGoogle } from "react-icons/fc";
import bgLogo from "../assets/images/bgsvg.svg";
import homeLogo from "../assets/images/homelogo.svg";
import messageIllus from "../assets/images/messageIllus.svg";
import codeLogo from "../assets/images/logo.png";
import { loginNormalUser } from "../services/authServices";
import { Auth } from "../types/Auth";
import { useDispatch } from "react-redux";
import { setAuth } from "../reducers/authSlice";
import { getRoleFromClaims } from "../helpers";
export const LoginPage: FC = () => {
  const toast = useToast();
  const dispatch = useDispatch();
  const loginWithGoogle = async () => {
    const result = await loginNormalUser();
    if (result.status === "failed" || result.error) {
      toast({
        title: "Could not log user in",
        description: result?.error?.message || "Unknown error",
        status: "error",
      });
      return;
    }
    const idToken = await result.user?.getIdTokenResult();
    const authUser: Auth = {
      displayName: result.user?.displayName || "Unknown name",
      photoUrl: result.user?.photoURL || "",
      uid: result.user?.uid || "",
      role: getRoleFromClaims(idToken?.claims || {}),
      dateRegistered: result.user?.metadata.creationTime || "",
    };
    dispatch(setAuth(authUser));
  };
  return (
    <Flex height="100vh" width="100vw" position="relative">
      <Image left={0} top={0} position="absolute" src={bgLogo} alt="bg" />
      <Image
        width="80px"
        right={5}
        top={5}
        position="absolute"
        src={codeLogo}
        alt="logo"
      />
      <Image
        zIndex={-1}
        left="10%"
        bottom={10}
        position="absolute"
        src={messageIllus}
        alt="bg"
      />
      <Grid
        templateColumns={{
          base: "2fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(2, 1fr)",
        }}
        height="100vh"
        gap={3}
        position="relative"
      >
        <GridItem
          height="100vh"
          width="100%"
          display="flex"
          alignItems={{
            base: "flex-start",
            md: "center",
            lg: "center",
          }}
          justifyContent={{
            base: "center",
            md: "center",
            lg: "center",
          }}
          flexWrap="wrap"
        >
          <Box
            pl={10}
            mt={{ base: "30%", md: -6, lg: -12 }}
            mr={{ base: 0, md: -12, lg: -12 }}
            width="70%"
          >
            <Image
              display={{ base: "block", md: "none", lg: "none" }}
              src={homeLogo}
              width={{ base: "250px", md: "auto", lg: "auto" }}
            />
            <Heading fontSize={{ base: "5xl", lg: "7xl" }}>CODE</Heading>
            <Text lineHeight={1.8} maxWidth="80%" my={5}>
              Connected Development&apos;s project management, collaboration and
              planning all in one workspace
            </Text>
            <HStack spacing={10} alignItems="center">
              <Button
                onClick={loginWithGoogle}
                leftIcon={<FcGoogle />}
                variant="solid"
                colorScheme="brand"
                size="lg"
              >
                Login
              </Button>
            </HStack>
          </Box>
        </GridItem>
        <GridItem
          display={{ base: "none", md: "flex" }}
          justifyContent="center"
          height={{ base: "max-content", lg: "100vh" }}
          pt={10}
        >
          <Image
            src={homeLogo}
            width={{ base: "250px", md: "auto", lg: "auto" }}
          />
        </GridItem>
      </Grid>
    </Flex>
  );
};
