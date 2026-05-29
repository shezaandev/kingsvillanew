import React from "react";
import { InvoiceData } from "../../types";
import { formatINR } from "../utils/billingUtils";

interface Props {
  data: InvoiceData;
}

const InvoiceTemplate = React.forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const subtotal = data.lineItems.reduce((s, i) => s + i.amount, 0);
  const balanceDue = data.fullyPaid ? 0 : Math.max(0, subtotal - data.advanceReceived);
  const qrData = `upi://pay?pa=${data.upiId}&am=${balanceDue}&cu=INR&tn=${data.invoiceNumber}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

  return (
    <div ref={ref} className="invoice-template-wrap" style={{ width: "1200px", background: "#f1ece4", padding: "10px", boxSizing: "border-box" }}>
      <style>{`
        .invoice-template-wrap { background:#f1ece4; }
        .invoice-template-wrap * { margin:0; padding:0; box-sizing:border-box; font-family:'Inter',sans-serif; }
        .invoice-template-wrap .invoice { max-width:1200px; margin:auto; background:#f1ece4; border-radius:26px; overflow:hidden; border:1px solid rgba(255,255,255,0.05); box-shadow:0 20px 60px rgba(0,0,0,0.45); }
        .invoice-template-wrap .top { background:linear-gradient(135deg,#071120 0%,#0d1c34 40%,#13294b 100%); padding:34px; display:flex; justify-content:space-between; align-items:flex-start; }
        .invoice-template-wrap .brand h1 { color:#d8ae56; font-size:54px; font-weight:800; line-height:1; letter-spacing:-2px; }
        .invoice-template-wrap .brand span { color:#f1d79a; font-size:12px; letter-spacing:2px; font-weight:500; display:block; margin-top:10px; }
        .invoice-template-wrap .brand p { color:#8d97a7; margin-top:18px; line-height:1.8; font-size:13px; }
        .invoice-template-wrap .invoice-box { width:300px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:24px; padding:28px; }
        .invoice-template-wrap .invoice-box small { color:#7d8794; letter-spacing:4px; font-size:10px; font-weight:700; }
        .invoice-template-wrap .invoice-box h2 { color:#fff; font-size:50px; margin:12px 0 24px; font-weight:800; line-height:1; }
        .invoice-template-wrap .invoice-meta { display:flex; justify-content:space-between; color:#7d8794; font-size:13px; }
        .invoice-template-wrap .invoice-meta strong { display:block; color:#fff; margin-top:5px; }
        .invoice-template-wrap .content { padding:32px; }
        .invoice-template-wrap .label { font-size:10px; letter-spacing:5px; color:#7a7a7a; margin-bottom:18px; font-weight:700; }
        .invoice-template-wrap .guest-name { font-size:42px; font-weight:800; margin-bottom:10px; color:#0d1c34; }
        .invoice-template-wrap .guest-sub { color:#777; margin-bottom:34px; font-size:14px; }
        .invoice-template-wrap .cards { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-bottom:34px; }
        .invoice-template-wrap .card { background:#faf8f4; border-radius:20px; padding:24px; }
        .invoice-template-wrap .card.dark { background:linear-gradient(180deg,#081120,#102240); color:#fff; }
        .invoice-template-wrap .card .small { font-size:10px; letter-spacing:4px; color:#909090; margin-bottom:16px; font-weight:700; }
        .invoice-template-wrap .card h3 { font-size:26px; margin-bottom:8px; font-weight:800; color:#0d1c34; }
        .invoice-template-wrap .card.dark h3 { color:#fff; }
        .invoice-template-wrap .card p { font-size:13px; color:#868686; }
        .invoice-template-wrap .card.dark p { color:rgba(255,255,255,0.7); }
        .invoice-template-wrap .main-grid { display:grid; grid-template-columns:1fr 340px; gap:24px; }
        .invoice-template-wrap .table-box { background:#faf8f4; border-radius:22px; overflow:hidden; }
        .invoice-template-wrap table { width:100%; border-collapse:collapse; }
        .invoice-template-wrap thead { background:linear-gradient(90deg,#081120,#13294b); color:#fff; }
        .invoice-template-wrap thead th { padding:22px; font-size:11px; text-align:left; letter-spacing:3px; }
        .invoice-template-wrap tbody td { padding:24px 22px; border-bottom:1px solid #ece5dc; font-size:15px; color:#333; }
        .invoice-template-wrap tbody td:last-child { font-weight:700; }
        .invoice-template-wrap .pay-box { background:linear-gradient(180deg,#081120,#102240); border-radius:24px; padding:22px; color:#fff; }
        .invoice-template-wrap .pay-title { display:flex; justify-content:center; margin-bottom:22px; }
        .invoice-template-wrap .pay-title span { background:linear-gradient(135deg,#d8ae56,#f2d18a); color:#081120; padding:11px 24px; border-radius:999px; font-size:12px; letter-spacing:3px; font-weight:800; box-shadow:0 0 18px rgba(216,174,86,0.35),0 8px 20px rgba(0,0,0,0.25); }
        .invoice-template-wrap .qr-box { background:rgba(255,255,255,0.04); border-radius:20px; padding:24px; text-align:center; display:flex; flex-direction:column; align-items:center; }
        .invoice-template-wrap .qr-box img { width:190px; background:#fff; padding:10px; border-radius:14px; display:block; margin:0 auto; }
        .invoice-template-wrap .upi { margin-top:14px; color:#8c99aa; font-size:13px; }
        .invoice-template-wrap .due { font-size:54px; color:#d8ae56; font-weight:800; margin:18px 0; line-height:1; }
        .invoice-template-wrap .due.paid { color:#27c281; }
        .invoice-template-wrap .pay-buttons { display:flex; justify-content:center; align-items:center; gap:12px; margin-top:8px; }
        .invoice-template-wrap .pay-buttons button { border:none; padding:10px 18px; border-radius:999px; background:#fff; font-weight:700; font-size:12px; cursor:default; color:#0D1117; }
        .invoice-template-wrap .pay-buttons span { color:#7f8ca1; font-size:12px; }
        .invoice-template-wrap .note { margin-top:18px; background:rgba(255,255,255,0.04); padding:16px; border-radius:14px; color:#8b97a8; line-height:1.7; font-size:12px; }
        .invoice-template-wrap .bottom { display:grid; grid-template-columns:1fr 340px; gap:24px; margin-top:24px; }
        .invoice-template-wrap .terms { background:#faf8f4; border-radius:22px; padding:30px; min-height:260px; display:flex; flex-direction:column; justify-content:space-between; }
        .invoice-template-wrap .terms ul { padding-left:18px; line-height:2; color:#666; font-size:14px; }
        .invoice-template-wrap .signature { display:flex; justify-content:space-between; align-items:flex-end; margin-top:40px; }
        .invoice-template-wrap .signature-line { width:180px; border-top:1px solid #999; text-align:center; padding-top:10px; color:#777; font-size:11px; letter-spacing:3px; }
        .invoice-template-wrap .summary { background:linear-gradient(180deg,#081120,#102240); color:#fff; border-radius:24px; padding:24px; }
        .invoice-template-wrap .summary-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; }
        .invoice-template-wrap .summary-head h3 { font-size:34px; line-height:1; }
        .invoice-template-wrap .badge { background:#3d2d0f; color:#d8ae56; padding:8px 14px; border-radius:999px; font-size:11px; letter-spacing:2px; font-weight:700; }
        .invoice-template-wrap .badge.paid { background:#0f3d1f; color:#27c281; }
        .invoice-template-wrap .summary-row { display:flex; justify-content:space-between; margin-bottom:20px; color:#d0d6de; font-size:15px; }
        .invoice-template-wrap .summary-row.green { color:#27c281; font-weight:700; }
        .invoice-template-wrap .summary hr { border:none; border-top:1px solid rgba(255,255,255,0.08); margin:24px 0; }
        .invoice-template-wrap .final-label { color:#8b98a9; font-size:14px; }
        .invoice-template-wrap .final { color:#d8ae56; font-size:52px; font-weight:800; margin-top:10px; line-height:1; }
        .invoice-template-wrap .final.paid { color:#27c281; }
      `}</style>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <div className="invoice">
        <div className="top">
          <div className="brand">
            <h1>Kings Diamond Villas</h1>
            <span>Where Luxury Meets Peaceful Hillside Escapes</span>
            <p>Lonavala, Maharashtra<br />+91 72081 62620 • booking@kingsdiamondsvillaslonavala.com</p>
          </div>
          <div className="invoice-box">
            <small>INVOICE</small>
            <h2>#{data.invoiceNumber}</h2>
            <div className="invoice-meta">
              <div>Issue Date<strong>{data.issueDate}</strong></div>
              <div style={{ textAlign: "right" }}>Payment<strong>{data.paymentMethod}</strong></div>
            </div>
          </div>
        </div>

        <div className="content">
          <div className="label">GUEST INFORMATION</div>
          <div className="guest-name">{data.guestName}</div>
          <div className="guest-sub">
            {data.guestPhone} • {data.bookingType} • {data.adults} Adults {data.children > 0 ? ` · ${data.children} Children` : ""}
          </div>

          <div className="cards">
            <div className="card">
              <div className="small">CHECK-IN</div>
              <h3>{data.checkIn}</h3>
              <p>{data.checkInTime}</p>
            </div>
            <div className="card">
              <div className="small">CHECK-OUT</div>
              <h3>{data.checkOut}</h3>
              <p>{data.checkOutTime}</p>
            </div>
            <div className="card">
              <div className="small">VILLA GUESTS</div>
              <h3>{data.adults + data.children}</h3>
              <p>Entire Villa Access</p>
            </div>
            <div className="card dark">
              <div className="small">STAY DURATION</div>
              <h3>{data.stayDuration}</h3>
              <p>{data.stayType}</p>
            </div>
          </div>

          <div className="main-grid">
            <div>
              <div className="label">CHARGES BREAKDOWN</div>
              <div className="table-box">
                <table>
                  <thead>
                    <tr>
                      <th>SERVICE / DESCRIPTION</th>
                      <th>QTY</th>
                      <th>RATE</th>
                      <th>AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lineItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.description}</td>
                        <td>{item.qty}</td>
                        <td>₹{formatINR(item.rate)}</td>
                        <td>₹{formatINR(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pay-box">
              <div className="pay-title"><span>SCAN TO PAY</span></div>
              <div className="qr-box" style={{ position: "relative" }}>
                {data.fullyPaid && (
                  <div style={{
                    position: "absolute",
                    top: "12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                    background: "#27c281",
                    color: "#081120",
                    fontSize: "10px",
                    fontWeight: 800,
                    padding: "6px 12px",
                    borderRadius: "999px",
                    letterSpacing: "1px",
                    boxShadow: "0 4px 10px rgba(39,194,129,0.3)",
                    zIndex: 2
                  }}>
                    FULLY PAID
                  </div>
                )}
                <img src={qrUrl} alt="QR" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                <div className="upi">UPI ID: {data.upiId}</div>
                <div className={`due ${data.fullyPaid ? "paid" : ""}`}>
                  {data.fullyPaid ? "FULLY PAID" : `₹${formatINR(balanceDue)}`}
                  <br />
                  {data.fullyPaid ? "No Balance" : "Due"}
                </div>
                <div className="pay-buttons">
                  <button type="button">{data.fullyPaid ? "PAID" : "UPI / QR"}</button>
                  <span>Instant Safe Pay</span>
                </div>
              </div>
              <div className="note">
                Payment confirmation will be shared instantly after successful transfer.
                Kindly share transaction screenshot with management.
              </div>
            </div>
          </div>

          <div className="bottom">
            <div className="terms">
              <div>
                <div className="label">TERMS & CONDITIONS</div>
                <ul>
                  <li>Security deposit refundable upon checkout after inspection.</li>
                  <li>No outside guests allowed without prior permission.</li>
                  <li>Booking is non-refundable on cancellation or early checkout.</li>
                  <li>Property damage will be deducted from security deposit.</li>
                </ul>
              </div>
              <div className="signature">
                <strong>Kings Diamond Villas Management</strong>
                <div className="signature-line">AUTHORIZED SIGNATURE</div>
              </div>
            </div>

              <div className="summary">
                <div className="summary-head">
                  <h3>Payment<br />Summary</h3>
                  <div className={data.status === "PAID" ? "badge paid" : "badge"}>
                    {data.status}
                  </div>
                </div>
                {data.lineItems.map((item) => (
                  <div className="summary-row" key={item.id}>
                    <span>{item.description}</span><strong>₹{formatINR(item.amount)}</strong>
                  </div>
                ))}
                <div className="summary-row">
                  <span>Charges Subtotal</span><strong>₹{formatINR(subtotal)}</strong>
                </div>
                <div className="summary-row" style={{ borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: "12px", color: "#FAF6EE", fontWeight: "bold" }}>
                  <span>Total Amount</span><strong>₹{formatINR(subtotal)}</strong>
                </div>
                {data.advanceReceived > 0 && (
                  <div className="summary-row green">
                    <span>Advance Received</span><strong>- ₹{formatINR(data.advanceReceived)}</strong>
                  </div>
                )}
                <hr />
                <div className="final-label">Balance Due Amount</div>
                <div className={balanceDue === 0 ? "final paid" : "final"}>
                  {balanceDue === 0 ? "FULLY PAID" : `₹${formatINR(balanceDue)}`}
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = "InvoiceTemplate";
export default InvoiceTemplate;
