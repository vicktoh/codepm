import React, { FC } from "react";
import {
  Button,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { BsCalendar, BsShield } from "react-icons/bs";
import { BiStats } from "react-icons/bi";
import { LogFilterForm } from "../components/LogFilterForm";
import { LogList } from "../components/LogList";

export const LogsPage: FC = () => {
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });
  return (
    <Flex width="100%" direction="row" px={5}>
      <Flex direction="column" flex={isMobile ? 1 : 5}>
        <Heading fontSize="xl" my={2}>
          Logs
        </Heading>
        <SimpleGrid columns={[1, 1, 2]} spacing={isMobile ? 0 : 2} mt={5}>
          <VStack alignItems="flex-start" spacing={2}>
            <Heading mb={5} fontSize="lg">
              Actions
            </Heading>
            <Button variant="outline" leftIcon={<Icon as={BsCalendar} />}>
              Apply for leave
            </Button>
            <Button variant="outline" leftIcon={<Icon as={BsShield} />}>
              Request for Access
            </Button>
            {isMobile ? (
              <Button variant="outline" leftIcon={<Icon as={BiStats} />}>
                Show Log Stats
              </Button>
            ) : null}
          </VStack>
          <LogFilterForm />
        </SimpleGrid>
        <LogList />
      </Flex>
      {isMobile ? null : (
        <Flex direction="column" flex={2}>
          <Heading>Hithere</Heading>
        </Flex>
      )}
    </Flex>
  );
};
