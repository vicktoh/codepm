import { Button, Flex, HStack, Text } from "@chakra-ui/react";
import React, { FC } from "react";

type PaginationProps = {
  pagination: number[];
  setPage: (page: number) => void;
  currentPage: number;
  pages: number;
};
export const Pagination: FC<PaginationProps> = ({
  pagination,
  setPage,
  currentPage,
  pages,
}) => {
  return (
    <Flex alignItems="center" justifyContent="center" width="100%" mt={3}>
      <Flex alignItems="center" ml="auto">
        {pagination.map((number, i) => (
          <Button
            variant="link"
            size="sm"
            mx={2}
            onClick={() => setPage(number - 1)}
            bg={currentPage === number - 1 ? "brand.500" : "white"}
            color={currentPage === number - 1 ? "white" : "brand.500"}
            key={`pagination-link-${number}`}
          >
            {number}
          </Button>
        ))}
      </Flex>
      <HStack ml="auto">
        <Text>Showing</Text>
        <Text>{currentPage + 1}</Text>
        <Text>of</Text>
        <Text>{pages}</Text>
      </HStack>
    </Flex>
  );
};
