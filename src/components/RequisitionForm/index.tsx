import React, { FC } from "react";
import {
  Requisition,
  RequisitionCurrency,
  RequisitionFormValues,
  RequisitionStatus,
  RequisitionType,
} from "../../types/Requisition";
import * as yup from "yup";
import { format } from "date-fns";
import { Form, Formik } from "formik";
import { DetailForm } from "./DetailForm";
import { Beneficiary } from "./Beneficiary";
import { ItemsForm } from "./ItemsForm";
import { useAppSelector } from "../../reducers/types";
import { converNumtoWord, requisitonTotal } from "../../helpers";
import { useToast } from "@chakra-ui/react";
import {
  addNewRequisition,
  updateRequisition,
} from "../../services/requisitionServices";

type RequisitionFormProps = {
  requisition?: Requisition;
  mode: "add" | "edit";
  onClose: () => void;
};

export const RequisitionForm: FC<RequisitionFormProps> = ({
  requisition,
  mode,
  onClose,
}) => {
  const { auth } = useAppSelector(({ auth }) => ({ auth }));
  const toast = useToast();
  const initialValues: RequisitionFormValues = {
    title: requisition?.title || "",
    step: 1,
    type: requisition?.type || RequisitionType.requisition,
    items: requisition?.items || [],
    attachments: requisition?.attachments || [],
    date: requisition?.timestamp
      ? format(requisition.timestamp, "y-MM-dd")
      : format(new Date(), "y-MM-dd"),
    beneficiaryAccountNumber: requisition?.beneficiaryAccountNumber || "",
    beneficiaryBank: requisition?.beneficiaryBank || "",
    beneficiaryName: requisition?.beneficiaryName || "",
    currency: requisition?.currency || RequisitionCurrency.NGN,
  };
  const validationSchema = yup.object().shape({
    title: yup.string().required("Requisition title is required"),
    type: yup.string().required(),
    items: yup
      .array()
      .of(
        yup.object().shape({
          title: yup.string().required(),
          amount: yup.number().required(),
        }),
      )
      .min(1, "You must add at least one requisition item"),
    date: yup.date().required(),
    beneficiaryName: yup.string().required("Beneficiary name is required"),
    beneficiaryAccountNumber: yup
      .string()
      .required("Account Number is required"),
    beneficiaryBank: yup.string().required(),
    currency: yup.string().required(),
  });
  const renderFormStep = (step: number) => {
    switch (step) {
      case 1:
        return <DetailForm />;
      case 2:
        return <ItemsForm />;
      case 3:
        return <Beneficiary />;
    }
  };
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        if (!auth) return;
        const { date, step, ...rest } = values;
        const total = requisitonTotal(rest.items);
        const amountInWords = converNumtoWord(total, rest.currency);
        const newRequisition: Requisition = {
          ...rest,
          timestamp: new Date(date).getTime(),
          status: RequisitionStatus.pending,
          creator: {
            userId: auth.uid,
            username: auth.displayName,
            displayName: auth.displayName,
            photoUrl: auth.photoUrl,
          },
          creatorId: auth.uid,
          total,
          amountInWords,
          lastUpdated: new Date().getTime(),
        };
        if (mode === "add") {
          try {
            await addNewRequisition(auth.uid, newRequisition);
            onClose();
          } catch (error) {
            console.log(error);
            const err: any = error;
            toast({
              title: "Could not submit requisition",
              description: err?.message || "unexpected error",
              status: "error",
            });
          }
        }
        if (mode === "edit" && requisition?.id) {
          try {
            await updateRequisition(auth.uid, requisition.id, newRequisition);
            onClose();
          } catch (error) {
            console.log(error);
            const err: any = error;
            toast({
              title: "Could not update requisition",
              description: err?.message || "unexpected error",
              status: "error",
            });
          }
        }
      }}
    >
      {({ values }) => <Form>{renderFormStep(values.step)}</Form>}
    </Formik>
  );
};
