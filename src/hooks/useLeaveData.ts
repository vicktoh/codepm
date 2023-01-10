import { useToast } from "@chakra-ui/react";
import { FirebaseError } from "firebase/app";
import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { getPermissions } from "../services/permissionServices";
import { Permission } from "../types/Permission";

export const useLeaveData = (userId: string) => {
  const [permission, setPermission] = useState<Permission | null>();
  const [loading, setLoading] = useState<boolean>();
  const toast = useToast();
  const leaveCategory = _.groupBy(permission?.leaveDays, "type");
  const fetchUserPermission = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const permission = await getPermissions(userId);
      setPermission(permission);
    } catch (error) {
      const err = error as FirebaseError;
      console.log(error);
      toast({
        title: "Could not fetch LeaveDays for this user",
        status: "error",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);
  useEffect(() => {
    fetchUserPermission();
  }, [fetchUserPermission]);

  return { permission, loading, fetchUserPermission, leaveCategory };
};
