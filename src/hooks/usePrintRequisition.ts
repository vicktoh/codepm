import { getBase64FromUrl, tobase64 } from "../helpers";
import { useAppSelector } from "../reducers/types";
import { requisitionPrintDefinition } from "../services/requisitonPrint";
import { Requisition } from "../types/Requisition";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import codeLogo from "../assets/images/logo.png";
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

export const usePrintPrequisition = () => {
  const { users } = useAppSelector(({ users }) => ({ users }));
  const { usersMap = {} } = users || {};
  const printRequisition = async (
    requisition: Requisition,
    download: boolean,
  ) => {
    const {
      creatorId,
      budgetHolderId = "",
      checkedById = "",
      approvedById = "",
    } = { ...requisition };
    const signatures = [
      requisition.creator.signatureUrl || usersMap[creatorId]?.signatureUrl,
      requisition.budgetHolderCheck?.signatureUrl ||
        usersMap[budgetHolderId]?.signatureUrl,
      requisition.checkedby?.signatureUrl ||
        usersMap[checkedById]?.signatureUrl,
      requisition.approvedBy?.signatureUrl ||
        usersMap[approvedById]?.signatureUrl,
    ];
    const signatureDataUrls = [];
    for (const sig of signatures) {
      if (!sig) {
        signatureDataUrls.push(null);
        continue;
      }
      const dataUrl = (await getBase64FromUrl(sig)) as string;
      signatureDataUrls.push(dataUrl);
    }
    const logoImage = await tobase64(codeLogo);
    const docDefinition = requisitionPrintDefinition(
      { ...requisition },
      logoImage as string,
      signatureDataUrls,
    );
    if (download) {
      pdfMake.createPdf(docDefinition as any).download();
    } else {
      pdfMake.createPdf(docDefinition as any).open();
    }
  };

  return printRequisition;
};
