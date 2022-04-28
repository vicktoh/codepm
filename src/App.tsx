import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { useAppSelector } from './reducers/types';
import { firebaseAuth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth'
import { Auth } from './types/Auth';
import { useDispatch } from 'react-redux';
import { setAuth } from './reducers/authSlice';
import { useLoadingAnimation } from './hooks/useLoadingAnimation';
import { LoginPage } from './pages/LoginPage';
const codeLogo = require('./assets/images/logo.png');


function App() {
  const [isLoading, setLoading] = useState<boolean>(true);
  const { auth } = useAppSelector(({auth})=> ({auth}))
  const dispatch  = useDispatch();
  const loadingAnimation = useLoadingAnimation();
  useEffect(()=> {
    if(!auth){
     const unsubscribe =  onAuthStateChanged(firebaseAuth, (user)=> {
        if(user){
          const newAuth: Auth = {
            displayName: user.displayName || "Unknown Name",
            uid: user.uid,
            photoUrl: user?.photoURL || "",
            role: 'user'
          }

          dispatch(setAuth(newAuth));
        }
        else{
          dispatch(setAuth({}))
        }
        setLoading(false);

      })

      return () => unsubscribe();
    }
  }, [auth, dispatch]);

  if(isLoading && !auth){
    return (
      <Flex width="100vw" height="100vh" alignItems="center" justifyContent="center">
          <Box  animation={loadingAnimation}>
            <Image width={100}  src = {codeLogo} alt= "Logo Code" />
            <Text fontSize="lg">Please wait</Text>
          </Box>
      </Flex>
    )
  }

  if(auth === null || Object.keys(auth).length === 0){
    return (
        <LoginPage />
    )
  }

  return (
    <Flex width="100vw" height="100vh" alignItems="center" justifyContent="center">
      <Heading>CODE's Project management tool</Heading>
      <Text>This is an inital setup of for continous integration and continous deployment</Text>
    </Flex>
      
      
    
  );
}

export default App;
