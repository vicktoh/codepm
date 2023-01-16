import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
} from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import { LoadingComponent } from "../components/LoadingComponent";
import { Pagination } from "../components/Pagination";
import { UserRow } from "../components/UserRow";
import { NUMBER_OF_USERS_PERPAGE } from "../constants";
import { paginationArray } from "../helpers";
import { useSearchIndex } from "../hooks/useSearchIndex";
import { UserRole } from "../types/Profile";
import { User } from "../types/User";

export const UserListsPage = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  const {
    loading,
    data: users,
    setQuery,
    setFacets,
    setPage,
    pageStat,
    groups,
    setData,
  } = useSearchIndex<User>("users", "", NUMBER_OF_USERS_PERPAGE);
  const pages = useMemo(() => {
    return Math.ceil((pageStat?.total || 0) / NUMBER_OF_USERS_PERPAGE);
  }, [pageStat?.total]);
  const pagination = useMemo(() => {
    return paginationArray(pageStat?.currentPage || 0, pages);
  }, [pageStat, pages]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>();
  const updateUserRole = (i: number, role: UserRole) => {
    if (!users) return;
    const newUsers = [...users];
    newUsers[i].role = role;
    setData(newUsers);
  };
  const onEnterQuery = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      setQuery(searchInput);
    }
  };
  return (
    <Flex direction="column" width="100%" pt={5} flex="1 1" px={5} pb={5}>
      <SimpleGrid columns={[1, 2]} gap={5}>
        <FormControl>
          <FormLabel>Search for User</FormLabel>
          <Input
            onKeyUp={onEnterQuery}
            placeholder="Search User"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            color="black"
            textColor="black"
            _placeholder={{ color: "black" }}
            colorScheme="brand"
            variant="outline"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Filter Department</FormLabel>
          <Select
            value={selectedDepartment}
            onChange={(e) => {
              setFacets([e.target.value]);
            }}
          >
            <option value="" selected>
              All departments
            </option>
            {Object.entries((groups || {})["department"] || []).map(
              ([department]) => (
                <option
                  key={`department-${department}`}
                  value={`department:${department}`}
                >{`${department}`}</option>
              ),
            )}
          </Select>
        </FormControl>
      </SimpleGrid>
      <Flex direction="column" width="100%" pt={5} flex="1 1">
        {loading && !users?.length ? (
          <LoadingComponent title="Fetching Users" />
        ) : (
          users?.map((user, i) => (
            <UserRow
              updateUser={(role) => updateUserRole(i, role)}
              user={user}
              key={`user-row-${i}`}
            />
          ))
        )}
        <Pagination
          pagination={pagination}
          pages={pages}
          setPage={setPage}
          currentPage={pageStat?.currentPage || 0}
        />
      </Flex>
    </Flex>
  );
};
