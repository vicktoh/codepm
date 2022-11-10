import { format } from "date-fns";
import { Requisition } from "../types/Requisition";

// playground requires you to assign document definition to a variable called dd
const dataField = (label: string, value: string) => ({
  stack: [
    {
      text: label,
      style: "label",
    },
    {
      text: value,
      style: "value",
    },
  ],
  margin: [0, 5],
});
const signatureField = (
  label: string,
  name: string,
  date: string,
  image: string,
) => ({
  stack: [
    {
      text: label,
      style: "label",
    },
    {
      text: name,
      style: "value",
    },
    {
      text: date,
      style: "value",
      margin: [0, 5],
    },
    image ? { image, width: 80, height: 50 } : {},
  ],
});

export const requisitionPrintDefinition = (
  requisition: Requisition,
  logoImage: string,
  signatures: (string | null)[],
) => {
  return {
    header: {
      image: logoImage,
      width: 80,
      height: 50,
      margin: [10, 0, 0, 20],
    },
    content: [
      {
        text: requisition.type.toUpperCase(),
        style: "header",
      },
      {
        alignment: "justify",
        columns: [
          {
            text: [{ text: "PV No: ", bold: true }, requisition.id || ""],
          },
          {
            text: [
              { text: "Date:", bold: true },
              format(requisition.timestamp, "do MMM y"),
            ],
            alignment: "right",
          },
        ],
      },
      {
        text: "General Info",
        style: "subheader",
        margin: [0, 15, 0, 10],
      },
      dataField("Title", requisition.title),
      {
        columns: [
          dataField("Requested By", requisition.creator.displayName),
          dataField("Type", requisition.type),
        ],
      },
      {
        text: "Project Info",
        style: "subheader",
        margin: [0, 15, 0, 10],
      },
      dataField("Project title", requisition.projectTitle || "N/A"),
      dataField("Project activity", requisition.acitivityTitle || "N/A"),
      {
        text: "Beneficiaries",
        style: "subheader",
        margin: [0, 15, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", "*", "*"],
          body: [
            [
              { text: "Name", style: "tableheader" },
              { text: "Bank", style: "tableheader" },
              { text: "Account Number", style: "tableheader" },
            ],
            ...(requisition.beneficiaries?.length
              ? requisition.beneficiaries.map(
                  ({ name, accountNumber, bank }) => [
                    { text: name },
                    { text: bank },
                    { text: accountNumber },
                  ],
                )
              : []),
          ],
        },
        layout: {
          fillColor: function (rowIndex: number) {
            if (rowIndex === 0) return "#EEB3B3";
            return rowIndex % 2 === 0 ? "#F1D6D6" : null;
          },
        },
      },
      {
        text: "Items",
        style: "subheader",
        margin: [0, 15, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", "*", "*"],
          body: [
            [
              { text: "Item Description", style: "tableheader" },
              { text: "Budget Line", style: "tableheader" },
              { text: "Amount", style: "tableheader" },
            ],
            ...requisition.items.map(({ amount, title, budget }) => [
              { text: title },
              { text: budget },
              { text: amount.toLocaleString() },
            ]),
          ],
        },
        layout: {
          fillColor: function (rowIndex: number) {
            if (rowIndex === 0) return "#EEB3B3";
            return rowIndex % 2 === 0 ? "#EFF2F4" : null;
          },
        },
      },

      {
        columns: [
          dataField(
            "Total",
            `${requisition.currency} ${requisition.total.toLocaleString()}`,
          ),
          dataField("Amount in Words", requisition.amountInWords),
        ],
        margin: [0, 20, 0, 20],
      },
      {
        columns: [
          signatureField(
            "Raised by",
            requisition.creator.displayName,
            format(requisition.timestamp, "do MMM Y"),
            signatures[0] || "",
          ),
          signatureField(
            "Budget Holder",
            requisition.budgetHolderCheck?.displayName || "",
            format(
              requisition.budgetHolderCheckedTimestamp || new Date(),
              "do MMM Y",
            ) || "",
            signatures[1] || "",
          ),
          signatureField(
            "Checked by",
            requisition.checkedby?.displayName || "",
            format(requisition.checkedTimeStamp || new Date(), "do MMM Y"),
            signatures[2] || "",
          ),
          signatureField(
            "Approved By",
            requisition.approvedBy?.displayName || "",
            format(
              requisition.approvedCheckedTimestamp || new Date(),
              "do MMM Y",
            ),
            signatures[3] || "",
          ),
        ],
      },
    ],

    styles: {
      header: {
        fontSize: 24,
        bold: true,
        alignment: "center",
        margin: [0, 10],
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 6],
        color: "grey",
      },
      body: {
        fontSize: 12,
        fontWeight: "bold",
      },
      label: {
        fontSize: 12,
        bold: true,
        margin: [0, 5],
      },
      value: {
        fontSize: 14,
      },
      tableheader: {
        bold: true,
      },
      signature: {
        width: 100,
        height: 80,
      },
    },
  };
};
