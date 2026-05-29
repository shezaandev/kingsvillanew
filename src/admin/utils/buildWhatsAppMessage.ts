import { InvoiceData } from "../../types";
import { formatINR } from "./billingUtils";

export function buildWhatsAppMessage(data: InvoiceData): string {
  const subtotal = data.lineItems.reduce((s, i) => s + i.amount, 0);
  const balanceDue = Math.max(0, subtotal - data.advanceReceived);
  const isPaid = balanceDue === 0;

  const itemLines = data.lineItems
    .map((item) => `• ${item.description}: ₹${formatINR(item.amount)}`)
    .join("\n");

  return `Hello ${data.guestName}! 👑

*Kings Diamond Villas — Invoice ${data.invoiceNumber}*
━━━━━━━━━━━━━━━━━━

📅 *Check-In:* ${data.checkIn} at ${data.checkInTime}
📅 *Check-Out:* ${data.checkOut} at ${data.checkOutTime}
🌙 *Stay:* ${data.stayDuration} (${data.stayType})
👥 *Guests:* ${data.adults} Adults${data.children > 0 ? ` · ${data.children} Children` : ""}

💰 *Charges Breakdown*
━━━━━━━━━━━━━━━━━━
${itemLines}

🧾 *Total: ₹${formatINR(subtotal)}*
${data.advanceReceived > 0 ? `✅ *Advance Paid: ₹${formatINR(data.advanceReceived)}*\n` : ""}${
    isPaid
      ? "🎉 *Status: FULLY PAID — Thank you!*"
      : `⚠️ *Balance Due: ₹${formatINR(balanceDue)}*\n💳 Pay via UPI: ${data.upiId}`
  }

━━━━━━━━━━━━━━━━━━
Please find your invoice PDF attached to this message.
We look forward to welcoming you to Kings Diamond Villas! 🏡✨

For any queries, reach us anytime.
— Kings Diamond Villas Team`;
}
