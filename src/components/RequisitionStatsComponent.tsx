import {
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { FC, useEffect, useState } from "react";
import { AiFillWarning } from "react-icons/ai";
import { BsCheck2All } from "react-icons/bs";
import { FaMoneyBill } from "react-icons/fa";
import { MdPending } from "react-icons/md";
import { useAppSelector } from "../reducers/types";
import { listenOnRequisitionStats } from "../services/requisitionServices";
import { RequisitionStats } from "../types/Requisition";
import { EmptyState } from "./EmptyState";
import { LoadingComponent } from "./LoadingComponent";

const RequisitionStatsComponent: FC = () => {
  const { auth } = useAppSelector(({ auth }) => ({ auth }));
  const [stats, setStats] = useState<RequisitionStats>();
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();

  useEffect(() => {
    if (!stats) {
      const unsub = listenOnRequisitionStats(
        auth?.uid || "",
        (stats) => {
          setLoading(false);
          setStats(stats);
        },
        (error) => {
          setLoading(false);

          toast({
            title: "could not fetch stats try again",
            description: error || "Unexpected error",
            status: "error",
          });
        },
      );
      return unsub;
    }
  }, [stats, toast, auth]);
  if (loading) {
    return <LoadingComponent title="Fetching requisition stats" />;
  }
  return (
    <Flex direction="column" flex="1 1">
      {stats ? (
        <>
          <SimpleGrid columns={2} gridGap={6}>
            <Flex
              direction="column"
              alignItems="center"
              py={3}
              borderRadius="md"
              bg="white"
            >
              <HStack alignItems="center">
                <Icon boxSize={8} as={BsCheck2All} color="green.300" />
                <Heading>{stats.approvedRequisitions || 0}</Heading>
              </HStack>
              <Text>Approved</Text>
            </Flex>
            <Flex
              direction="column"
              alignItems="center"
              py={3}
              borderRadius="md"
              bg="white"
            >
              <HStack alignItems="center">
                <Icon boxSize={8} as={MdPending} color="yellow.300" />
                <Heading>{stats.pendingRequisitions || 0}</Heading>
              </HStack>
              <Text>Pending</Text>
            </Flex>
            <Flex
              direction="column"
              alignItems="center"
              py={3}
              borderRadius="md"
              bg="white"
            >
              <HStack alignItems="center">
                <Icon boxSize={8} as={AiFillWarning} color="orange.300" />
                <Heading>{stats.pendingRetirement || 0}</Heading>
              </HStack>
              <Text>Pending Retirement</Text>
            </Flex>
            <Flex
              direction="column"
              alignItems="center"
              py={3}
              borderRadius="md"
              bg="white"
            >
              <HStack alignItems="center">
                <Icon boxSize={8} as={FaMoneyBill} color="blue.300" />
                <Heading>
                  {stats.totalApprovedSum
                    ? `${stats.totalApprovedSum.toLocaleString()}`
                    : 0}
                </Heading>
              </HStack>
              <Text>Approved Sum</Text>
            </Flex>
          </SimpleGrid>
        </>
      ) : (
        <EmptyState title="Could not fetch stats" />
      )}
    </Flex>
  );
};

export default RequisitionStatsComponent;
