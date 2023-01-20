import { Flex, Heading } from "@chakra-ui/react";
import React, { FC, useEffect, useState } from "react";
import { fetchUserTasks } from "../services/taskServices";
import { Task } from "../types/Project";
import { LoadingComponent } from "./LoadingComponent";
import { Doughnut } from "react-chartjs-2";
import * as _ from "lodash";
import { EmptyState } from "./EmptyState";
type UserTaskStatsProps = {
  userId: string;
};
export const UserTaskStats: FC<UserTaskStatsProps> = ({ userId }) => {
  const [loading, setLoading] = useState<boolean>();
  const [task, setTasks] = useState<Task[]>();

  const parseTasksTodata = () => {
    const categories = _.groupBy(task, "status");
    const data = [];
    const labels = [];
    for (const key in categories) {
      if (Object.prototype.hasOwnProperty.call(categories, key)) {
        data.push(categories[key].length);
        labels.push(key);
      }
    }
    return {
      labels,
      datasets: [
        {
          label: "Task break down",
          data,
          backgroundColor: [
            "rgba(196, 252, 239, 1)",
            "rgba(249, 248, 113, 1)",
            "rgba(255, 128, 102, 1)",
          ],
          borderColor: [
            "rgba(255, 255, 255, 1)",
            "rgba(255, 255, 255, 1)",
            "rgba(255, 255, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };
  useEffect(() => {
    const getUserTask = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const tasks = await fetchUserTasks(userId);
        setTasks(tasks);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getUserTask();
  }, [userId]);

  if (loading) return <LoadingComponent title="Fetching task stats" />;
  return (
    <Flex
      alignSelf="center"
      direction="column"
      bg="white"
      py={3}
      px={3}
      maxHeight="350px"
      overflowY="auto"
      overflowX="hidden"
      borderRadius="lg"
    >
      <Heading my={5} mx="auto" fontSize="lg">
        Assigned Tasks
      </Heading>
      {task ? (
        <Flex maxWidth="235px" alignSelf="center">
          <Doughnut data={parseTasksTodata()} />
        </Flex>
      ) : (
        <EmptyState title="No tasks Assigned to theis person" />
      )}
    </Flex>
  );
};
