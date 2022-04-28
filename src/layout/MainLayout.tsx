import React, { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Flex, Heading, Image, useBreakpointValue } from '@chakra-ui/react';
import { SideNav } from '../components/SideNav';
import { useAppSelector } from '../reducers/types';
import homeLogo from '../assets/images/homelogo.svg';
import { MobileNav } from '../components/MobileNav';
export const MainLayout: FC = () => {
    const { auth } = useAppSelector(({ auth }) => ({ auth }));
    const isMobile = useBreakpointValue({base: true, md: false, lg: false})
    if (!auth) {
        return (
            <Flex
                width="100vw"
                height="100vh"
                justifyContent="center"
                alignItems="center"
            >
                <Heading>
                    {' '}
                    🔐 You are not logged in Please Login to proceed
                </Heading>
            </Flex>
        );
    }

    return (
        <Flex
            bgGradient="linear(242.84deg, #EFA6B4 .94%, #537FC2 100%)"
            width="100vw"
            height="100vh"
            direction="row"
            position="relative"
        >
            <Image
                src={homeLogo}
                alt="bg Image"
                position="absolute"
                top="50%"
                left="50%"
                sx={{ transform: 'translateX(-50%) translateY(-50%)' }}
                opacity={0.8}
            />
            <Flex
                border="1px solid white"
                background="rgba(255, 255, 255, .32)"
                borderRadius= {["none", "2xl"]}
                backdropFilter= "blur(5.8px)"
                boxShadow= "0 4px 30px rgba(0, 0, 0, 0.1)"
                zIndex={1}
                height={{base: "100vh", md: "95vh", lg: "95vh"}}
                my="auto"
                direction="row"
                width="100%"
                maxWidth="90rem"
                mx="auto"
                pr={[0, null, null, 10]}
            >
                <SideNav auth={auth} />
                <Box
                    marginLeft={{base:0, md: "18rem", lg: "18rem"}}
                  height={{base: "100vh", md: "95vh", lg: "95vh"}}
                    my="auto"
                    width="100%"
                    
                >
                   {isMobile ? <MobileNav /> : null}
                    <Outlet />
                </Box>
            </Flex>
        </Flex>
    );
};
