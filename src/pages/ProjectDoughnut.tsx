import React, { FC } from 'react';
import { Chart as ChartJs, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
    Flex,
    Heading,
    HStack,
    Icon,
    Stat,
    StatHelpText,
    StatNumber,
    Text,
    useBreakpointValue,
    VStack,
} from '@chakra-ui/react';
import { useGlassEffect } from '../hooks/useLoadingAnimation';
import { FiCheckCircle } from 'react-icons/fi';
import {
    AiFillStop,
    AiOutlineClockCircle,
} from 'react-icons/ai';
ChartJs.register(ArcElement, Tooltip, Legend);

const data = {
    labels: ['successfull', 'pending', 'not-started'],
    datasets: [
        {
            label: 'Project overview',
            data: [12, 8, 4],
            backgroundColor: [
                'rgba(196, 252, 239, 1)',
                'rgba(249, 248, 113, 1)',
                'rgba(255, 128, 102, 1)',
            ],
            borderColor: [
                'rgba(255, 255, 255, 1)',
                'rgba(255, 255, 255, 1)',
                'rgba(255, 255, 255, 1)',
            ],
            borderWidth: 1,
        },
    ],
};

export const ProjectDoughnut: FC = () => {
    const glassEffect = useGlassEffect(true);
    const isMobile = useBreakpointValue({ base: true, md: false, lg: false });
    const Stack = isMobile ? HStack : VStack;
    return (
        <Flex direction="column" justifyContent="space-between">
            <Flex
                justifyContent="center"
                alignItems="center"
                p={5}
                {...glassEffect}
                direction="column"
            >
                <Heading fontSize="md" my={3}>
                    Project Task Stats
                </Heading>
                <Doughnut data={data} />
            </Flex>
            <Flex
                justifyContent="center"
                alignItems="center"
                p={5}
                {...glassEffect}
                direction="column"
                mt={3}
            >
                <Stack spacing={[2, 5]} alignItems={['flex-start']}>
                    <Stat>
                        <StatNumber alignItems="center" display="flex">
                            <HStack>
                                <Icon color="green.300" as={FiCheckCircle} />
                                <Text>12</Text>
                            </HStack>
                        </StatNumber>
                        <StatHelpText>Completed Task</StatHelpText>
                    </Stat>
                    <Stat>
                        <StatNumber alignItems="center" display="flex">
                            <HStack>
                                <Icon
                                    color="yellow.400"
                                    as={AiOutlineClockCircle}
                                />
                                <Text>8</Text>
                            </HStack>
                        </StatNumber>
                        <StatHelpText>Pending Task</StatHelpText>
                    </Stat>
                    <Stat>
                        <StatNumber alignItems="center" display="flex">
                            <HStack>
                                <Icon color="red.500" as={AiFillStop} />
                                <Text>4</Text>
                            </HStack>
                        </StatNumber>
                        <StatHelpText>Not Started Task</StatHelpText>
                    </Stat>
                </Stack>
            </Flex>
        </Flex>
    );
};
