import {
  Avatar,
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LeaveTable } from "../components/LeaveTable";
import { LoadingComponent } from "../components/LoadingComponent";
import { UserLogStats } from "../components/UserLogStats";
import { UserTaskStats } from "../components/UserTaskStats";
import { fetchProfile } from "../services/profileServices";
import { Profile } from "../types/Profile";

export const UserProfilePage = () => {
  const params = useParams();
  const [loadingUser, setLoadingUser] = useState<boolean>();
  const [profile, setProfile] = useState<Profile>();
  useEffect(() => {
    const getUserProfile = async () => {
      if (!params.userId) return;
      try {
        setLoadingUser(true);
        const prfl = await fetchProfile(params.userId);
        setProfile(prfl);
      } catch (error) {
      } finally {
        setLoadingUser(false);
      }
    };
    getUserProfile();
  }, [params.userId]);
  return (
    <Flex direction="column" flex="1 1" height="100%">
      <SimpleGrid gridGap={5} columns={[1, 2]} flex="1 1">
        {loadingUser ? (
          <LoadingComponent title="Fetching Profile" />
        ) : (
          <Flex direction="column" px={3}>
            <Heading fontSize="lg">
              {profile?.displayName || "Uknown User"}
            </Heading>
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
              <VStack spacing={2} mt={5} mb={5}>
                <Box position="relative">
                  <Avatar
                    name={profile?.displayName}
                    src={profile?.photoUrl || profile?.photoUrl || ""}
                    size="xl"
                  />
                </Box>
                <Heading fontSize="md">
                  {profile?.displayName || "Unknow User name"}
                </Heading>
              </VStack>
              <SimpleGrid columns={3} mt={5} gridGap={8}>
                <Box mb={3}>
                  <Text>Designation</Text>
                  <Heading fontSize="md">
                    {profile?.designation || "None"}
                  </Heading>
                </Box>
                <Box mb={3}>
                  <Text>Date of Birth</Text>
                  <Heading fontSize="md">
                    {profile?.dateOfBirth || "None"}
                  </Heading>
                </Box>
                <Box mb={3}>
                  <Text>Role</Text>
                  <Heading fontSize="md">{profile?.role || "User"}</Heading>
                </Box>
              </SimpleGrid>
              <SimpleGrid columns={2} mt={5}>
                <Box mb={3}>
                  <Text>Phone Number</Text>
                  <Heading fontSize="md">
                    {profile?.phoneNumber || "None"}
                  </Heading>
                </Box>
                <Box mb={3}>
                  <Text>Departments</Text>
                  <Heading fontSize="md">
                    {profile?.department || "None"}
                  </Heading>
                </Box>
              </SimpleGrid>
            </Flex>
          </Flex>
        )}

        <UserLogStats userId={params?.userId || ""} />
      </SimpleGrid>
      <SimpleGrid mt={5} gridGap={5} columns={[1, 2]} flex="1 1">
        <LeaveTable userId={params?.userId || ""} />
        <UserTaskStats userId={params?.userId || ""} />
      </SimpleGrid>
    </Flex>
  );
};
