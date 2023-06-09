import React, { useEffect, useState } from "react";
import { Box, Flex, Image, Text, useToast } from "@chakra-ui/react";
import { useAppSelector } from "./reducers/types";
import { firebaseAuth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Auth } from "./types/Auth";
import { useDispatch } from "react-redux";
import { setAuth } from "./reducers/authSlice";
import { useLoadingAnimation } from "./hooks/useLoadingAnimation";
import { LoginPage } from "./pages/LoginPage";
import { MainNavigation } from "./navigation/MainNavigation";
import { BrowserRouter } from "react-router-dom";
import { fetchUsers, listenOnProfile } from "./services/profileServices";
import { setProfile } from "./reducers/profileSlice";
import { setUsers } from "./reducers/usersSlice";
import { listenOnSystem, reportMyPresence } from "./services/authServices";
import {
  listenOnConversations,
  listenOnPressence,
} from "./services/chatServices";
import { setConversations } from "./reducers/conversationSlice";
import { setPresence } from "./reducers/presenceSlice";
import { listenOnLogs } from "./services/logsServices";
import { setLog } from "./reducers/logSlice";
import { setSystem } from "./reducers/systemSlice";
import { listenOnPermission } from "./services/permissionServices";
import { setPermisson } from "./reducers/permissionSlice";
import { getRoleFromClaims, isEmailAllowed } from "./helpers";
import { listenOnProjects } from "./services/projectServices";
import { setProjects } from "./reducers/projectSlice";
import { listenOnNofification } from "./services/notificationServices";
import { setNotification } from "./reducers/notificationSlice";
const codeLogo = require("./assets/images/logo.png");

function App() {
  const [isLoading, setLoading] = useState<boolean>(true);
  const {
    auth,
    users,
    conversations,
    presence,
    logs,
    system,
    permission,
    projects,
    notifications,
  } = useAppSelector(
    ({
      auth,
      users,
      conversations,
      presence,
      logs,
      system,
      permission,
      projects,
      notifications,
    }) => ({
      auth,
      users,
      conversations,
      presence,
      logs,
      system,
      permission,
      projects,
      notifications,
    }),
  );
  const dispatch = useDispatch();
  const loadingAnimation = useLoadingAnimation();
  const toast = useToast();
  useEffect(() => {
    if (!auth) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          if (!isEmailAllowed(user.email || "")) return;
          const idToken = await user.getIdTokenResult();
          const newAuth: Auth = {
            displayName: user.displayName || "Unknown Name",
            uid: user.uid,
            photoUrl: user?.photoURL || "",
            role: getRoleFromClaims(idToken.claims),
            dateRegistered: user.metadata.creationTime || "",
          };

          dispatch(setAuth(newAuth));
        } else {
          dispatch(setAuth(null));
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [auth, dispatch]);

  useEffect(() => {
    const fetchProfile = () => {
      if (auth) {
        return listenOnProfile(auth.uid, (profile) => {
          dispatch(setProfile(profile));
        });
      }
      return null;
    };

    const unsub = fetchProfile();

    return () => {
      if (unsub) unsub();
    };
  }, [auth, dispatch]);

  useEffect(() => {
    const getUsers = async () => {
      if (!users) {
        const us = await fetchUsers();
        dispatch(setUsers(us));
        return;
      }
      return null;
    };
    getUsers();
  }, [users, dispatch]);

  useEffect(() => {
    if (auth?.uid) {
      try {
        reportMyPresence(auth.uid);
      } catch (error) {
        const err: any = error;
        toast({
          title: "error",
          description: err?.message || "unexpected error",
          status: "error",
        });
      }
    }
  }, [auth, toast]);

  useEffect(() => {
    if (logs || !auth?.uid) return;
    try {
      listenOnLogs(auth?.uid, (logs) => {
        dispatch(setLog(logs));
      });
    } catch (error) {
      console.log(error);
    }
  }, [logs, auth?.uid, dispatch]);

  useEffect(() => {
    if (conversations || !auth?.uid) return;
    try {
      const unsub = listenOnConversations(auth?.uid, (data) => {
        dispatch(setConversations(data));
      });

      // return () => unsub();
    } catch (error) {
      console.log(error);
    }
  }, [conversations, auth?.uid, dispatch]);

  useEffect(() => {
    if (presence || !auth?.uid) return;
    try {
      listenOnPressence(auth.uid, (pres) => {
        dispatch(setPresence(pres));
      });
    } catch (error) {
      console.log(error);
    }
  }, [presence, dispatch, auth?.uid]);

  useEffect(() => {
    if (system) return;
    try {
      listenOnSystem((system) => {
        dispatch(setSystem(system));
      });
    } catch (error) {
      console.log(error);
    }
  }, [system, dispatch]);

  // Notification
  useEffect(() => {
    if (notifications || !auth) return;
    try {
      listenOnNofification(auth.uid, (notifications) => {
        dispatch(setNotification(notifications));
      });
    } catch (error) {
      console.log(error);
    }
  }, [notifications, auth, dispatch]);

  useEffect(() => {
    if (permission || !auth?.uid) return;
    try {
      listenOnPermission(auth.uid, (perm) => {
        dispatch(setPermisson(perm));
      });
    } catch (error) {
      console.log(error);
    }
  }, [permission, dispatch, auth]);

  useEffect(() => {
    if (projects) return;
    try {
      listenOnProjects((projs) => {
        dispatch(setProjects(projs));
      });
    } catch (error) {
      console.log(error);
    }
  }, [projects, dispatch]);

  if (isLoading && !auth) {
    return (
      <Flex
        width="100vw"
        height="100vh"
        alignItems="center"
        justifyContent="center"
      >
        <Box animation={loadingAnimation}>
          <Image width={100} src={codeLogo} alt="Logo Code" />
          <Text fontSize="lg">Please wait</Text>
        </Box>
      </Flex>
    );
  }

  if (auth === null || Object.keys(auth).length === 0) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <MainNavigation />
    </BrowserRouter>
  );
}

export default App;
