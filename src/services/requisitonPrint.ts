import { format } from "date-fns";
import { Requisition } from "../types/Requisition";
import { User } from "../types/User";
import { VehicleRequest } from "../types/VehicleRequest";

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
      alignment: "right",
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
            text: [
              { text: "PV No: ", bold: true },
              requisition.approvedCheckedTimestamp || "",
            ],
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
      dataField("Project activity", requisition.activityTitle || "N/A"),
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
            "Reviewed By",
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
        fontSize: 12,
        bold: true,
        margin: [0, 6],
        color: "red",
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
        color: "#8a7c7b",
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

export const vehicleApprovalPrint = (
  request: VehicleRequest,
  logoImage: string,
  signature: string,
  usersMap: Record<string, User | undefined>,
) => {
  return {
    header: {
      image: logoImage,
      width: 80,
      height: 50,
      alignment: "right",
    },
    content: [
      {
        text: "Vehicle Request Approval",
        style: "header",
        alignment: "center",
        margin: [0, 20, 0, 10],
      },
      {
        text: format(request.datetimestamp, "do MMM Y"),
        style: "datestyle",
      },
      {
        text: "General Info",
        style: "subheader",
      },
      {
        stack: [
          {
            text: "Requested By",
            style: "labelstyle",
          },
          {
            text: usersMap[request.userId]?.displayName || "Unknown user",
            style: "valuestyle",
          },
        ],
        margin: [0, 0, 0, 20],
      },
      {
        stack: [
          {
            text: "Purpose of trip",
            style: "labelstyle",
          },
          {
            text: request.purpose,
            style: "valuestyle",
          },
        ],
        margin: [0, 0, 0, 20],
      },
      {
        columns: [
          {
            width: "*",
            stack: [
              {
                text: "From",
                style: "labelstyle",
              },
              {
                text: request.origin,
                style: "valuestyle",
              },
            ],
          },
          {
            width: "*",
            stack: [
              {
                text: "Destination",
                style: "labelstyle",
              },
              {
                text: request.destination,
                style: "valuestyle",
              },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },
      {
        columns: [
          {
            width: "*",
            stack: [
              {
                text: "Start Time",
                style: "labelstyle",
              },
              {
                text: format(request.startTime, "KK:mm aaa"),
                style: "valuestyle",
              },
            ],
          },
          {
            width: "*",
            stack: [
              {
                text: "End Time",
                style: "labelstyle",
              },
              {
                text: format(request.endTime, "KK:mm aaa"),
                style: "valuestyle",
              },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },
      {
        stack: [
          {
            text: "Riders",
            style: "labelstyle",
          },
          {
            text: request.riders
              .map((userId) => usersMap[userId]?.displayName || "unknownUser")
              .join(", "),
            style: "valuestyle",
          },
        ],
      },
      {
        stack: [
          {
            text: "Approved by",
            style: "labelstyle",
          },
          {
            text:
              usersMap[request.approvedBy || ""]?.displayName || "Unknown User",
            style: "valuestyle",
          },
          {
            image: signature,
            fit: [80, 50],
            margin: [0, 10],
          },
        ],

        margin: [0, 40],
      },

      {
        text: "this request has been approved by the following authorithy above",
        style: "disclaimerstyle",
      },
    ],
    styles: {
      header: {
        fontSize: 24,
        bold: true,
        alignment: "justify",
      },
      subheader: {
        fontsize: 12,
        bold: true,
        color: "red",
        margin: [0, 0, 0, 10],
      },
      logo: {
        fontSize: 24,
        bold: true,
        color: "red",
      },
      labelstyle: {
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 5],
      },
      valuestyle: {
        fontSize: 14,
        color: "#63625c",
      },
      datestyle: {
        alignment: "center",
        color: "#cf7b74",
        margin: [0, 0, 0, 20],
      },
      disclaimerstyle: {
        fontSize: 10,
        color: "red",
        italics: true,
        alignment: "center",
      },
    },
  };
};
