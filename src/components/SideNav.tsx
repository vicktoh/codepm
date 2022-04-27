import { Avatar, Button, Flex, Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import React, {FC} from 'react';
import { Link } from 'react-router-dom';
import { Auth } from '../types/Auth';
import { AiOutlineCheckSquare, AiOutlineDashboard } from 'react-icons/ai';
import { FaTasks } from 'react-icons/fa';
import { BsChat, BsCurrencyDollar, BsPower } from 'react-icons/bs';

type SideNavProps = {
   auth: Auth
} 

export const SideNav: FC<SideNavProps> = ({ auth: { displayName, photoUrl}})=> {


   return (
      <Flex width = "16rem" borderRadius="lg" px={6} height= "100vh" position = "fixed" top="0" zIndex={1}  py={5}>
         <Heading>Connected</Heading>
         <VStack>
            <Avatar name = {displayName} src={photoUrl}  size = "lg" />
            <Text>{displayName}</Text>
         </VStack>
         <VStack>
            <HStack as = {Link} to = "/" spacing={2}>
               <Icon as = {AiOutlineDashboard} />
               <Text>Dashboard</Text>
            </HStack>
            <HStack as = {Link} to = "/" spacing={2}>
               <Icon as = {FaTasks} />
               <Text>Tasks</Text>
            </HStack>
            <HStack as = {Link} to = "/" spacing={2}>
               <Icon as = {BsChat} />
               <Text>Chats</Text>
            </HStack>
            <HStack as = {Link} to = "/" spacing={2}>
               <Icon as = {AiOutlineCheckSquare} />
               <Text>Logs</Text>
            </HStack>
            <HStack as = {Link} to = "/" spacing={2}>
               <Icon as = {BsCurrencyDollar} />
               <Text>Requisition</Text>
            </HStack>
         </VStack>

         <Button variant="ghost" leftIcon={<Icon as = {BsPower} />} >Logout</Button>

      </Flex>
   )
}