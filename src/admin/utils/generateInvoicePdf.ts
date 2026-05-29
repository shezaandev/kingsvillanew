import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generateInvoicePdf(
  element: HTMLElement,
  invoiceNumber: string,
  guestName: string
): Promise<{ blob: Blob; filename: string }> {
  // Wait for fonts and images to fully load
  await document.fonts.ready;
  await new Promise(res => setTimeout(res, 300));

  const images = element.querySelectorAll("img");
  await Promise.all(
    Array.from(images).map(img =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>(res => {
            img.onload = () => res();
            img.onerror = () => res();
          })
    )
  );

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#f1ece4",
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const pdfWidth = 210;
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
    unit: "mm",
    format: [pdfWidth, pdfHeight],
  });

  pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

  const filename = `KDV-Invoice-${invoiceNumber}-${guestName.replace(/\s+/g, "-")}.pdf`;
  return { blob: pdf.output("blob"), filename };
}
