import { Avatar, Button, Flex, Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import React, {FC} from 'react';
import { Link, useMatch } from 'react-router-dom';
import { Auth } from '../types/Auth';
import { AiOutlineCheckSquare, AiOutlineDashboard } from 'react-icons/ai';
import { FaTasks } from 'react-icons/fa';
import { BsChat, BsCurrencyDollar, BsPower } from 'react-icons/bs';
import { useLogout } from '../hooks/useLoadingAnimation';

type SideNavProps = {
   auth: Auth
} 

export const SideNav: FC<SideNavProps> = ({ auth: { displayName, photoUrl}})=> {
   const onLogout = useLogout();
   return (
      <Flex display={{base: "none", md: "flex", lg: "flex"}}  background="rgba(255, 255, 255, .32)"  direction="column" width = "16rem" borderRadius="2xl" px={6} height= "95vh" position = "fixed" top="0" zIndex={1}  py={5}>
         <Heading fontSize="xl" my={3} alignSelf="center">Connected</Heading>
         <VStack>
            <Avatar as = {Link} to ="/profile" name = {displayName} src={photoUrl}  size = "lg" />
            <Text fontWeight="bold">{displayName}</Text>
         </VStack>
         <VStack alignItems="flex-start" alignSelf="center" mt={12} spacing={10}>
            <HStack as = {Link} to = "/" spacing={2} color={!!useMatch('/') ? 'brand.400': 'tetiary'}>
               <Icon as = {AiOutlineDashboard} />
               <Text>Dashboard</Text>
            </HStack>
            <HStack as = {Link} to = "/tasks" spacing={2} color={!!useMatch('/tasks') ? 'brand.400': 'tetiary'}>
               <Icon as = {FaTasks} />
               <Text>Tasks</Text>
            </HStack>
            <HStack as = {Link} to = "/chat" spacing={2} color={!!useMatch('/chat') ? 'brand.400': 'tetiary'}>
               <Icon as = {BsChat} />
               <Text>Chats</Text>
            </HStack>
            <HStack as = {Link} to = "/logs" spacing={2} color={!!useMatch('/logs') ? 'brand.400': 'tetiary'}>
               <Icon as = {AiOutlineCheckSquare} />
               <Text>Logs</Text>
            </HStack>
            <HStack as = {Link} to = "/requisitions" spacing={2} color={!!useMatch('/requisitions') ? 'brand.400': 'tetiary'}>
               <Icon as = {BsCurrencyDollar} />
               <Text>Requisition</Text>
            </HStack>
         </VStack>
         <HStack as = {Button} onClick={onLogout} to = "/" spacing={2} mt='auto' alignSelf="center" mb={10}>
         <Icon as = {BsPower} />
               <Text>Logout</Text>
         </HStack>

      </Flex>
   )
}