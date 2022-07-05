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
import { reportMyPresence } from "./services/authServices";
import {
  listenOnConversations,
  listenOnPressence,
} from "./services/chatServices";
import { setConversations } from "./reducers/conversationSlice";
import { setPresence } from "./reducers/presenceSlice";
import { listenOnLogs } from "./services/logsServices";
import { setLog } from "./reducers/logSlice";
const codeLogo = require("./assets/images/logo.png");

function App() {
  const [isLoading, setLoading] = useState<boolean>(true);
  const { auth, users, conversations, presence, logs } = useAppSelector(
    ({ auth, users, conversations, presence, logs }) => ({
      auth,
      users,
      conversations,
      presence,
      logs,
    }),
  );
  const dispatch = useDispatch();
  const loadingAnimation = useLoadingAnimation();
  const toast = useToast();
  useEffect(() => {
    if (!auth) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        if (user) {
          const newAuth: Auth = {
            displayName: user.displayName || "Unknown Name",
            uid: user.uid,
            photoUrl: user?.photoURL || "",
            role: "user",
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
        console.log({ logs });
        dispatch(setLog(logs));
      });
    } catch (error) {
      console.log(error);
    }
  }, [logs, auth?.uid, dispatch]);

  useEffect(() => {
    if (conversations || !auth?.uid) return;
    try {
      listenOnConversations(auth?.uid, (data) => {
        dispatch(setConversations(data));
      });
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
