import { Flex, Heading, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingComponent } from "../components/LoadingComponent";
import { VehicleRequestsView } from "../components/VehicleRequestsView";
import { getFirestorDoc } from "../services/firebase";
import { VehicleRequest } from "../types/VehicleRequest";

export const VehicleReview = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigation = useNavigate();
  const [loading, setLoading] = useState<boolean>();
  const [vehicleRequest, setVehicleRequest] = useState<VehicleRequest>();
  const toast = useToast();
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!requestId) return;
      try {
        setLoading(true);
        const path = `vehicleRequests/${requestId}`;
        const response = await getFirestorDoc<VehicleRequest>(path);
        setVehicleRequest(response);
      } catch (error) {
        const err: any = error;
        toast({
          title: "Could not read vehicle request",
          description: err?.message || "Unknown",
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [requestId, toast]);

  if (loading) {
    return <LoadingComponent title="fetching Vehicle Request" />;
  }

  return vehicleRequest ? (
    <Flex
      direction="column"
      borderRadius={10}
      marginX="auto"
      mt={10}
      maxWidth="800px"
      width="100%"
      bg="whiteAlpha.400"
      justifyContent="center"
      p={10}
    >
      <Heading fontSize="xl" mb={3}>
        Vehicle Request
      </Heading>
      <VehicleRequestsView
        request={vehicleRequest}
        onClose={() => navigation("/")}
      />
    </Flex>
  ) : null;
};
