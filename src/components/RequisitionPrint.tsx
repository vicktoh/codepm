import { Flex } from "@chakra-ui/react";
import React, { FC } from "react";
import { Requisition } from "../types/Requisition";

type RequisitionPrintProps = {
  requisition: Requisition;
};
export const RequisitionPrint: FC<RequisitionPrintProps> = () => {
  return <Flex>The name is victor</Flex>;
};
