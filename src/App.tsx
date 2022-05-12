import React, { useEffect, useState } from 'react';
import { Box, Flex, Image, Text } from '@chakra-ui/react';
import { useAppSelector } from './reducers/types';
import { firebaseAuth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth'
import { Auth } from './types/Auth';
import { useDispatch } from 'react-redux';
import { setAuth } from './reducers/authSlice';
import { useLoadingAnimation } from './hooks/useLoadingAnimation';
import { LoginPage } from './pages/LoginPage';
import { MainNavigation } from './navigation/MainNavigation';
import { BrowserRouter } from 'react-router-dom';
import { listenOnProfile } from './services/profileServices';
import { setProfile } from './reducers/profileSlice';
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
          dispatch(setAuth(null))
        }
        setLoading(false);

      })

      return () => unsubscribe();
    }
  }, [auth, dispatch]);

  useEffect(() => {
    const  fetchProfile =() =>{
      if(auth){
        return listenOnProfile(auth.uid, profile =>{
          dispatch(setProfile(profile))
        })
      }
      return null
    }
    
    let unsub =  fetchProfile();

    return () => { if(unsub) unsub()}
    
  }, [auth, dispatch])
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
    <BrowserRouter>
    <MainNavigation />
    </BrowserRouter>
    
      
      
    
  );
}

export default App;
