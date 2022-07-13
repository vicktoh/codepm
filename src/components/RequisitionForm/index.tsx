import React, { FC } from "react";
import {
  Requisition,
  RequisitionCurrency,
  RequisitionFormValues,
  RequisitionType,
} from "../../types/Requisition";
import * as yup from "yup";
import { format } from "date-fns";
import { Form, Formik } from "formik";
import { DetailForm } from "./DetailForm";
import { Beneficiary } from "./Beneficiary";
import { ItemsForm } from "./ItemsForm";

type RequisitionFormProps = {
  requisition?: Requisition;
};

export const RequisitionForm: FC<RequisitionFormProps> = ({ requisition }) => {
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
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      {({ values }) => <Form>{renderFormStep(values.step)}</Form>}
    </Formik>
  );
};
