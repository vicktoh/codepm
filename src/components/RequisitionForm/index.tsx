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
  newRequisitionNotification,
  updateRequisition,
  updateVendorsList,
} from "../../services/requisitionServices";
import { sendMultipleNotification } from "../../services/notificationServices";

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
  const { auth, vendors, users } = useAppSelector(
    ({ auth, vendors, users }) => ({
      auth,
      vendors,
      users,
    }),
  );
  const { usersMap = {} } = users || {};
  const toast = useToast();
  const initialValues: RequisitionFormValues = {
    title: requisition?.title || "",
    step: 1,
    type: requisition?.type || RequisitionType["procurement request"],
    items: requisition?.items || [],
    projectId: requisition?.projectId || "",
    activityTitle: requisition?.acitivityTitle || "",
    date: requisition?.timestamp
      ? format(requisition.timestamp, "y-MM-dd")
      : format(new Date(), "y-MM-dd"),
    beneficiaries: requisition?.beneficiaries || [],
    currency: requisition?.currency || RequisitionCurrency.NGN,
    attentionTo: requisition?.attentionTo || [],
    budgetIds: requisition?.budgetIds || [],
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
    projectId: yup.string().required("Project must be selected"),
    beneficiaries: yup.array().of(
      yup.object().shape({
        accountNumber: yup
          .string()
          .required()
          .length(10, "Must be 10 characters"),
        bank: yup.string().required("field required"),
        name: yup.string().required("Required"),
      }),
    ),
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
            await updateVendorsList(
              auth.uid,
              vendors || {},
              newRequisition.beneficiaries,
            );
            if (newRequisition.attentionTo?.length) {
              newRequisitionNotification(
                {
                  raisedBy: auth.displayName,
                  title: "Requisition Alert",
                  ids: newRequisition.attentionTo || [],
                },
                usersMap,
              );
              sendMultipleNotification(newRequisition.attentionTo, {
                title: "Requisition Alert",
                linkTo: "/requisition-admin",
                description: `${auth.displayName} request your attention to the requesition titled "${newRequisition.title}"`,
                type: "requisition",
              });
            }
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
            await updateVendorsList(
              auth.uid,
              vendors || {},
              newRequisition.beneficiaries,
            );
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
