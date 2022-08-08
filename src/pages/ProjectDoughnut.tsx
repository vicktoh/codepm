import React, { FC, useEffect, useMemo, useState } from "react";
import { Chart as ChartJs, Tooltip, Legend, ArcElement } from "chart.js";
import { Doughnut } from "react-chartjs-2";
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
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useGlassEffect } from "../hooks/useLoadingAnimation";
import { FiCheckCircle } from "react-icons/fi";
import { AiFillStop, AiOutlineClockCircle } from "react-icons/ai";
import { Task, TaskStatus } from "../types/Project";
import { fetchProjectsTasks } from "../services/taskServices";
import { FirebaseError } from "firebase/app";
import * as _ from "lodash";
import { LoadingComponent } from "../components/LoadingComponent";
import { BsListOl } from "react-icons/bs";
import { parseTasksToChartData } from "../helpers";
ChartJs.register(ArcElement, Tooltip, Legend);

// const data = {
//   labels: ["successfull", "pending", "not-started"],
//   datasets: [
//     {
//       label: "Project overview",
//       data: [12, 8, 4],
//       backgroundColor: [
//         "rgba(196, 252, 239, 1)",
//         "rgba(249, 248, 113, 1)",
//         "rgba(255, 128, 102, 1)",
//       ],
//       borderColor: [
//         "rgba(255, 255, 255, 1)",
//         "rgba(255, 255, 255, 1)",
//         "rgba(255, 255, 255, 1)",
//       ],
//       borderWidth: 1,
//     },
//   ],
// };
type ProjectDoughnutProps = {
  projectId: string;
};
export const ProjectDoughnut: FC<ProjectDoughnutProps> = ({ projectId }) => {
  const glassEffect = useGlassEffect(true);
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });
  const Stack = isMobile ? HStack : VStack;
  const [loading, setLoading] = useState<boolean>(false);
  const [tasks, setTask] = useState<Task[]>();
  const data = useMemo(() => parseTasksToChartData(tasks || []), [tasks]);
  const categories = useMemo(() => {
    if (!tasks) return {};
    return _.groupBy(tasks, "status");
  }, [tasks]);
  console.log({ categories });
  const toast = useToast();
  useEffect(() => {
    const getProjectTask = async () => {
      try {
        setLoading(true);
        const res = await fetchProjectsTasks(projectId);
        setTask(res);
      } catch (error) {
        console.log(error);
        const { message: description } = error as FirebaseError;
        toast({
          title: "Could not fetch Tasks",
          status: "error",
          description,
        });
      } finally {
        setLoading(false);
      }
    };
    getProjectTask();
  }, [toast, projectId]);

  if (loading) return <LoadingComponent title="fetching stats" />;
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
        <Stack spacing={[2, 5]} alignItems={["flex-start"]}>
          <Stat>
            <StatNumber alignItems="center" display="flex">
              <HStack>
                <Icon color="blue.300" as={BsListOl} />

                <Text>
                  {categories[TaskStatus.planned]
                    ? categories[TaskStatus.planned].length
                    : "NA"}
                </Text>
              </HStack>
            </StatNumber>
            <StatHelpText>Planned Task</StatHelpText>
          </Stat>
          <Stat>
            <StatNumber alignItems="center" display="flex">
              <HStack>
                <Icon color="green.300" as={FiCheckCircle} />

                <Text>
                  {categories[TaskStatus.completed]
                    ? categories[TaskStatus.completed].length
                    : "NA"}
                </Text>
              </HStack>
            </StatNumber>
            <StatHelpText>Completed Task</StatHelpText>
          </Stat>
          <Stat>
            <StatNumber alignItems="center" display="flex">
              <HStack>
                <Icon color="yellow.400" as={AiOutlineClockCircle} />
                <Text>
                  {categories[TaskStatus.ongoing]
                    ? categories[TaskStatus.ongoing].length
                    : "NA"}
                </Text>
              </HStack>
            </StatNumber>
            <StatHelpText>Pending Task</StatHelpText>
          </Stat>
          <Stat>
            <StatNumber alignItems="center" display="flex">
              <HStack>
                <Icon color="red.500" as={AiFillStop} />
                <Text>
                  {categories[TaskStatus["not-started"]]
                    ? categories[TaskStatus["not-started"]].length
                    : "NA"}
                </Text>
              </HStack>
            </StatNumber>
            <StatHelpText>Not Started Task</StatHelpText>
          </Stat>
        </Stack>
      </Flex>
    </Flex>
  );
};
