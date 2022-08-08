import { Flex, Input } from "@chakra-ui/react";
import React, { useState } from "react";
import { LoadingComponent } from "../components/LoadingComponent";
import { UserRow } from "../components/UserRow";
import { useSearchIndex } from "../hooks/useSearchIndex";
import { UserRole } from "../types/Profile";
import { User } from "../types/User";

export const UserListsPage = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  const {
    loading,
    data: users,
    setQuery,
    setData,
  } = useSearchIndex<User[]>("users");

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
    <Flex direction="column" width="100%" pt={5} flex="1 1" px={5}>
      <Input
        onKeyUp={onEnterQuery}
        placeholder="Search User"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        my={2}
      />
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
      </Flex>
    </Flex>
  );
};
