import { Box, Button, Grid, GridItem, Heading, HStack, Image, Text } from '@chakra-ui/react';
import React, { FC } from 'react';
import {FcGoogle} from 'react-icons/fc';
import bgLogo from '../assets/images/bgsvg.svg';
import homeLogo from '../assets/images/homelogo.svg';
import messageIllus from '../assets/images/messageIllus.svg';
export const LoginPage: FC = () => {
    return (
        <Grid templateColumns="repeat(2, 1fr)" height="100vh" gap={3} position="relative">
            <GridItem
                height="100vh"
                width="100%"
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
            >
                <Box pl={10}>
                   <Image left = {0} top={0} position="absolute" src = {bgLogo} alt = "bg" />
                   <Image left = "10%" bottom={10} position="absolute" src = {messageIllus} alt = "bg" />
                    <Heading fontSize="7xl">Connected</Heading>
                    <Text lineHeight={1.8} maxWidth="80%" my={5}>
                        Connected Development's project management,
                        collaboration and planning all in one workspace
                    </Text>
                    <HStack spacing={10} alignItems="center">
                        <Button
                            leftIcon={<FcGoogle />}
                            variant="solid"
                            colorScheme="brand"
                        >
                            Login
                        </Button>
                        <Button
                            leftIcon={<FcGoogle />}
                            variant="outline"
                            borderColor="brand.500"
                            color="brand.400"
                        >
                            Admin Login
                        </Button>
                    </HStack>
                </Box>
            </GridItem>
            <GridItem height="100vh" pt={10}>
                <Image src={homeLogo} />
            </GridItem>
        </Grid>
    );
};
