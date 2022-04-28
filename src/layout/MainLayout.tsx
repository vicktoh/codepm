import { Box, Flex, Heading } from '@chakra-ui/react';
import React, {FC} from 'react';
import { Outlet } from 'react-router-dom';
import { SideNav } from '../components/SideNav';
import { useAppSelector } from '../reducers/types';



export const MainLayout: FC = ()=> {
   const {auth} = useAppSelector(({auth})=> ({auth}));
   if(!auth){
      return(
         <Flex width="100vw" height="100vh" justifyContent="center" alignItems="center">

            <Heading> 🔐 You are not logged in Please Login to proceed</Heading>

         </Flex>
      )
   }

   return(
      <Flex maxWidth="90rem" mx="auto" px={[6, null, null, 10]}>
         <SideNav auth= {auth} />
         <Box marginLeft="16rem">
            <Outlet />
         </Box>
      </Flex>
   )
}