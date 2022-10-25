import { Flex } from "@chakra-ui/react";
import React, { FC } from "react";
import { Requisition } from "../../types/Requisition";

type RequisitionPrintProps = {
  requisition: Requisition;
};
export const RequisitionPrint: FC<RequisitionPrintProps> = ({
  requisition,
}) => {
  return <Flex direction="column"></Flex>;
};
