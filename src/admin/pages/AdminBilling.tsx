import React, { useState, useEffect, useRef } from "react";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc, 
  query, 
  orderBy, 
  deleteDoc, 
  serverTimestamp,
  getDocFromServer
} from "firebase/firestore";
import { 
  Plus, 
  Eye, 
  Share2, 
  Trash2, 
  ReceiptText, 
  ArrowLeft, 
  Download, 
  MessageCircle, 
  X,
  CreditCard
} from "lucide-react";
import { db, auth } from "../../firebase";
import { InvoiceData, LineItem } from "../../types";
import { 
  formatINR, 
  formatDisplayDate, 
  isWeekendStay, 
  calcStayNights, 
  normalizePhone 
} from "../utils/billingUtils";
import { generateInvoicePdf } from "../utils/generateInvoicePdf";
import { buildWhatsAppMessage } from "../utils/buildWhatsAppMessage";
import InvoiceTemplate from "../components/InvoiceTemplate";

// Firestore compliance error handler as required by systems guidelines
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed info: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialise and test connection to Firestore as requested by specs
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

type BillingMode = "list" | "create" | "preview";

export default function AdminBilling() {
  const [mode, setMode] = useState<BillingMode>("list");
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(null);
  const [invoices, setInvoices] = useState<(InvoiceData & { id: string; createdAt: any })[]>([]);
  const [defaultUpiId, setDefaultUpiId] = useState("kingsdiamond@okaxis");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const invoiceRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    guestName: "", 
    guestPhone: "", 
    bookingType: "Full Property Booking",
    adults: 2, 
    children: 0,
    checkInDate: "", 
    checkInTime: "02:00 PM",
    checkOutDate: "", 
    checkOutTime: "11:00 AM",
    stayDuration: "", 
    stayType: "",
    paymentMethod: "UPI",
    upiId: "",
    advanceReceived: 0,
    notes: "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "item-1", description: "Villa Rent", qty: 1, rate: 0, amount: 0 },
    { id: "item-2", description: "Security Deposit (Refundable)", qty: 1, rate: 2000, amount: 2000 },
  ]);

  const [fullyPaid, setFullyPaid] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [upiSaving, setUpiSaving] = useState(false);
  const [upiSaved, setUpiSaved] = useState(false);

  // Load Past Invoices and Config
  const loadInvoices = async () => {
    try {
      const snap = await getDocs(query(collection(db, "invoices"), orderBy("createdAt", "desc")));
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, "invoices");
    }
  };

  const loadConfig = async () => {
    try {
      const snap = await getDoc(doc(db, "billingSettings", "config"));
      if (snap.exists() && snap.data().defaultUpiId) {
        setDefaultUpiId(snap.data().defaultUpiId);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, "billingSettings/config");
    }
  };

  useEffect(() => {
    loadInvoices().catch(console.error);
    loadConfig().catch(console.error);
  }, []);

  // Update form data upiId when defaultUpiId is retrieved
  useEffect(() => {
    setFormData(prev => ({ ...prev, upiId: defaultUpiId }));
  }, [defaultUpiId]);

  // Auto-calculate stay duration and weekend/weekday stay type
  useEffect(() => {
    const nights = calcStayNights(formData.checkInDate, formData.checkOutDate);
    if (nights > 0) {
      setFormData(prev => ({
        ...prev,
        stayDuration: `${nights} Night${nights > 1 ? "s" : ""}`,
        stayType: isWeekendStay(formData.checkInDate) ? "Weekend Stay" : "Weekday Stay",
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        stayDuration: "",
        stayType: "",
      }));
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  // Toast notifier
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  // Line item helpers
  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "qty" || field === "rate") {
        updated[index].amount = Number(updated[index].qty) * Number(updated[index].rate);
      }
      return updated;
    });
  };

  const addLineItem = () => {
    setLineItems(prev => [
      ...prev,
      { id: `item-${Date.now()}`, description: "", qty: 1, rate: 0, amount: 0 },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  // Computed Values
  const subtotal = lineItems.reduce((s, i) => s + i.amount, 0);
  const balanceDue = Math.max(0, subtotal - formData.advanceReceived);
  const invoiceStatus: "PAID" | "PARTIAL" = balanceDue === 0 ? "PAID" : "PARTIAL";

  // Form Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.guestName.trim()) errs.guestName = "Guest name is required";
    if (!formData.guestPhone.trim()) errs.guestPhone = "Phone number is required";
    else if (!/^\d{10,13}$/.test(formData.guestPhone.replace(/[\s+\-()]/g, "")))
      errs.guestPhone = "Enter a valid 10-13 digit phone number";
    if (!formData.checkInDate) errs.checkInDate = "Check-in date is required";
    if (!formData.checkOutDate) errs.checkOutDate = "Check-out date is required";
    else if (formData.checkOutDate <= formData.checkInDate)
      errs.checkOutDate = "Check-out must be after check-in";
    if (lineItems.every(i => i.amount === 0)) errs.lineItems = "Add at least one charge with an amount";
    if (Object.keys(errs).length > 0) {
      errs.submit = "Please correct the highlighted validation errors above.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Delete
  const handleDelete = async (invoiceId: string) => {
    try {
      await deleteDoc(doc(db, "invoices", invoiceId));
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      setConfirmDelete(null);
      showToast("✅ Invoice deleted successfully.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `invoices/${invoiceId}`);
    }
  };

  // Handle Save Default UPI
  const handleSaveDefaultUpi = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.upiId.trim()) return;
    setUpiSaving(true);
    try {
      await setDoc(doc(db, "billingSettings", "config"), {
        defaultUpiId: formData.upiId.trim(),
        lastUpdated: serverTimestamp(),
      });
      setDefaultUpiId(formData.upiId.trim());
      setUpiSaved(true);
      showToast("✓ Default UPI ID saved successfully");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "billingSettings/config");
    } finally {
      setUpiSaving(false);
    }
  };

  // Create Invoice and save to Firestore
  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      // Get chronological invoice number based on past document count at save-time
      const countSnap = await getDocs(collection(db, "invoices"));
      const num = String(countSnap.size + 1).padStart(4, "0");
      const invoiceNumber = `KDV-${num}`;

      const invoice: InvoiceData = {
        invoiceNumber,
        issueDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        guestName: formData.guestName.trim(),
        guestPhone: normalizePhone(formData.guestPhone),
        bookingType: formData.bookingType,
        adults: formData.adults,
        children: formData.children,
        checkIn: formatDisplayDate(formData.checkInDate),
        checkInTime: formData.checkInTime,
        checkOut: formatDisplayDate(formData.checkOutDate),
        checkOutTime: formData.checkOutTime,
        stayDuration: formData.stayDuration || "1 Night",
        stayType: formData.stayType || "Stay",
        lineItems,
        advanceReceived: formData.advanceReceived,
        paymentMethod: formData.paymentMethod,
        upiId: formData.upiId,
        fullyPaid: balanceDue === 0,
        status: invoiceStatus,
        notes: formData.notes,
      };

      // Save to Firebase Firestore database first
      await addDoc(collection(db, "invoices"), {
        ...invoice,
        createdAt: serverTimestamp(),
      });

      // Reload invoices state list in background
      loadInvoices().catch(console.error);

      // Directly trigger PDF download after saving
      setCurrentInvoice(invoice);
      setMode("list");
      setTimeout(async () => {
        if (invoiceRef.current) {
          setDownloading(true);
          try {
            await document.fonts.ready;
            await new Promise(res => setTimeout(res, 300));
            const { blob, filename } = await generateInvoicePdf(
              invoiceRef.current!, invoice.invoiceNumber, invoice.guestName
            );
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            showToast("✅ Invoice PDF downloaded successfully!");
          } catch (ex) {
            console.error(ex);
            showToast("❌ PDF generation failed. Please try again.");
          } finally {
            setDownloading(false);
          }
        }
      }, 400);
    } catch (err) {
      setErrors({ submit: "Failed to save invoice. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // PDF Download Trigger
  const handleDownload = async () => {
    if (!invoiceRef.current || !currentInvoice) return;
    setDownloading(true);
    try {
      const { blob, filename } = await generateInvoicePdf(
        invoiceRef.current, currentInvoice.invoiceNumber, currentInvoice.guestName
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; 
      a.download = filename; 
      a.click();
      URL.revokeObjectURL(url);
      showToast("✅ Invoice PDF downloaded successfully!");
    } catch (ex) {
      console.error(ex);
      showToast("❌ PDF generation failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Direct PDF download trigger for list rows
  const handleDownloadInvoice = async (inv: InvoiceData) => {
    setCurrentInvoice(inv);
    setTimeout(async () => {
      if (invoiceRef.current) {
        setDownloading(true);
        try {
          await document.fonts.ready;
          await new Promise(res => setTimeout(res, 300));
          const { blob, filename } = await generateInvoicePdf(
            invoiceRef.current!, inv.invoiceNumber, inv.guestName
          );
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
          showToast("✅ Invoice PDF downloaded successfully!");
        } catch (ex) {
          console.error(ex);
          showToast("❌ PDF generation failed. Please try again.");
        } finally {
          setDownloading(false);
        }
      }
    }, 400);
  };

  // WhatsApp Message Trigger
  const handleShare = async () => {
    if (!invoiceRef.current || !currentInvoice) return;
    setSharing(true);
    try {
      const { blob, filename } = await generateInvoicePdf(
        invoiceRef.current, currentInvoice.invoiceNumber, currentInvoice.guestName
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; 
      a.download = filename; 
      a.click();
      URL.revokeObjectURL(url);

      const message = buildWhatsAppMessage(currentInvoice);
      const phone = normalizePhone(currentInvoice.guestPhone);
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");

      showToast("📥 PDF saved! Attach it in the WhatsApp chat that opened.");
    } catch (ex) {
      console.error(ex);
      showToast("❌ Share failed. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  // Alternative entry-point for list-view instant sharing
  const handleWhatsAppDirect = (inv: InvoiceData) => {
    const message = buildWhatsAppMessage(inv);
    const phone = normalizePhone(inv.guestPhone);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    showToast("💬 WhatsApp Chat opened!");
  };

  return (
    <div className="flex-1 p-4 sm:p-6 text-[#FAF6EE] max-w-5xl mx-auto w-full">
      {toast && (
        <div className="fixed top-4 left-4 right-4 z-[100] bg-[#141B26] border border-[#C9A84C]/30 text-[#FAF6EE] text-sm font-medium px-4 py-3 rounded-xl shadow-2xl animate-[slideDown_0.3s_ease]">
          {toast}
        </div>
      )}

      {mode === "list" && (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#C9A84C]/20 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#F0D080]">Billing & Invoices</h1>
              <p className="text-xs sm:text-sm text-[#FAF6EE]/50 mt-1">Manage guest receipts, security deposits, and UPI collections.</p>
            </div>
            <button 
              onClick={() => {
                // reset form fields for a clean ticket creation
                setFormData({
                  guestName: "", 
                  guestPhone: "", 
                  bookingType: "Full Property Booking",
                  adults: 2, 
                  children: 0,
                  checkInDate: "", 
                  checkInTime: "02:00 PM",
                  checkOutDate: "", 
                  checkOutTime: "11:00 AM",
                  stayDuration: "", 
                  stayType: "",
                  paymentMethod: "UPI",
                  upiId: defaultUpiId,
                  advanceReceived: 0,
                  notes: "",
                });
                setLineItems([
                  { id: "item-1", description: "Villa Rent", qty: 1, rate: 0, amount: 0 },
                  { id: "item-2", description: "Security Deposit (Refundable)", qty: 1, rate: 2000, amount: 2000 },
                ]);
                setFullyPaid(false);
                setErrors({});
                setMode("create");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C9A84C] to-[#F0D080] text-[#0D1117] font-bold rounded-xl text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={16} /> New Invoice
            </button>
          </div>

          {/* Invoices List */}
          <div className="space-y-4">
            {invoices.map(inv => {
              const subtotalVal = inv.lineItems.reduce((s, i) => s + i.amount, 0);
              const balance = Math.max(0, subtotalVal - inv.advanceReceived);
              return (
                <div key={inv.id} className="bg-[#141B26] rounded-2xl p-4 sm:p-5 border border-[#C9A84C]/15 shadow-sm hover:border-[#C9A84C]/35 transition-all">
                  <div className="flex items-start justify-between mb-3 border-b border-[#C9A84C]/10 pb-3">
                    <div>
                      <span className="text-[#C9A84C] font-bold text-sm sm:text-base">#{inv.invoiceNumber}</span>
                      <span className={`ml-2.5 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        inv.status === "PAID"
                          ? "bg-[#0f3d1f] text-[#27c281]"
                          : "bg-[#3d2d0f] text-[#d8ae56]"
                      }`}>{inv.status}</span>
                    </div>
                    <span className="text-[#FAF6EE]/40 text-xs">{inv.issueDate}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3">
                    <div>
                      <p className="text-[#FAF6EE] font-serif font-bold text-base sm:text-lg">{inv.guestName}</p>
                      <p className="text-[#FAF6EE]/50 text-xs sm:text-sm mt-0.5">{inv.guestPhone}</p>
                      <p className="text-[#FAF6EE]/70 text-xs mt-1 bg-[#0D1117]/50 py-1 px-2.5 rounded-lg inline-block">{inv.bookingType}</p>
                    </div>
                    <div className="text-left md:text-right space-y-1">
                      <p className="text-[#FAF6EE]/50 text-xs">Stay Period</p>
                      <p className="text-[#FAF6EE]/80 text-xs sm:text-sm font-medium">
                        {inv.checkIn} → {inv.checkOut}
                      </p>
                      <p className="text-[#FAF6EE]/50 text-xs font-mono">{inv.stayDuration} ({inv.stayType}) · {inv.adults} Adults {inv.children > 0 ? ` · ${inv.children} Children` : ""}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-3 pt-3 border-t border-[#C9A84C]/10 gap-3">
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-[#FAF6EE]/50 text-[11px] uppercase tracking-wide">Total Charges</span>
                        <p className="text-[#FAF6EE] font-bold text-sm">₹{formatINR(subtotalVal)}</p>
                      </div>
                      <div>
                        <span className="text-[#FAF6EE]/50 text-[11px] uppercase tracking-wide">Balance Due</span>
                        <p className="text-[#C9A84C] font-black text-base">₹{formatINR(balance)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => handleDownloadInvoice(inv)}
                        title="Download A4 PDF"
                        className="p-2.5 rounded-xl bg-[#0D1117] border border-[#C9A84C]/20 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors cursor-pointer"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={() => handleWhatsAppDirect(inv)}
                        title="Share on WhatsApp"
                        className="p-2.5 rounded-xl bg-[#0D1117] border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/10 transition-colors cursor-pointer"
                      >
                        <Share2 size={16} />
                      </button>
                      <button 
                        onClick={() => setConfirmDelete(inv.id)}
                        title="Delete Invoice"
                        className="p-2.5 rounded-xl bg-[#0D1117] border border-[#E63946]/20 text-[#E63946] hover:bg-[#E63946]/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {confirmDelete === inv.id && (
                    <div className="mt-4 p-4 bg-[#E63946]/10 border border-[#E63946]/30 rounded-xl animate-fadeIn">
                      <p className="text-[#FAF6EE] text-sm mb-3">Delete this invoice? This action cannot be undone.</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDelete(inv.id)}
                          className="flex-1 py-2 bg-[#E63946] text-white font-bold rounded-lg text-xs"
                        >
                          Yes, Delete
                        </button>
                        <button 
                          onClick={() => setConfirmDelete(null)}
                          className="flex-1 py-2 border border-[#FAF6EE]/20 text-[#FAF6EE] rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {invoices.length === 0 && (
              <div className="text-center py-16 text-[#FAF6EE]/40">
                <ReceiptText size={40} className="mx-auto mb-4 opacity-30 text-[#C9A84C]" />
                <p className="text-base text-[#FAF6EE]/80 font-serif">No invoices yet.</p>
                <p className="text-xs mt-1">Tap "+ New Invoice" to generate your first custom bill.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {mode === "create" && (
        <form onSubmit={handleGenerateInvoice}>
          {/* Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#C9A84C]/20 mb-6">
            <button 
              type="button" 
              onClick={() => setMode("list")} 
              className="p-2 rounded-xl border border-[#C9A84C]/20 text-[#C9A84C] cursor-pointer active:scale-95 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold font-serif text-[#F0D080]">Create New Invoice</h1>
              <p className="text-[#FAF6EE]/50 text-xs">Fill out guest details, check-in schedules, and room inventory charges.</p>
            </div>
          </div>

          {/* Section 1: Guest Information */}
          <div className="bg-[#141B26] rounded-2xl p-4 sm:p-5 border border-[#C9A84C]/20 mb-5 relative">
            <h3 className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">
              1. Guest Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#FAF6EE]/60 uppercase mb-2">
                  Guest Name *
                </label>
                <input
                  type="text"
                  value={formData.guestName}
                  onChange={e => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                  placeholder="e.g. Shezaan Khan"
                  className={`w-full bg-[#0D1117] border rounded-xl px-4 py-3 text-[#FAF6EE] text-base outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all min-h-[48px] ${
                    errors.guestName ? "border-[#E63946]" : "border-[#C9A84C]/30 focus:border-[#C9A84C]"
                  }`}
                />
                {errors.guestName && <p className="text-[#E63946] text-xs mt-1">{errors.guestName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#FAF6EE]/60 uppercase mb-2">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={formData.guestPhone}
                  onChange={e => setFormData(prev => ({ ...prev, guestPhone: e.target.value }))}
                  placeholder="e.g. 8668945769"
                  className={`w-full bg-[#0D1117] border rounded-xl px-4 py-3 text-[#FAF6EE] text-base outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all min-h-[48px] ${
                    errors.guestPhone ? "border-[#E63946]" : "border-[#C9A84C]/30 focus:border-[#C9A84C]"
                  }`}
                />
                {errors.guestPhone && <p className="text-[#E63946] text-xs mt-1">{errors.guestPhone}</p>}
                <p className="text-[#FAF6EE]/40 text-xs mt-1">Digits with country code if outside India.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#FAF6EE]/60 uppercase mb-2">
                  Booking Type
                </label>
                <select
                  value={formData.bookingType}
                  onChange={e => setFormData(prev => ({ ...prev, bookingType: e.target.value }))}
                  className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#FAF6EE] text-base outline-none min-h-[48px] cursor-pointer"
                >
                  <option value="Full Property Booking">Full Property Booking (Entire Villa)</option>
                  <option value="Individual Suite Booking">Individual Suite Booking</option>
                  <option value="Special Event / Shoot Package">Special Event / Shoot Package</option>
                  <option value="Weekday Stay promotion">Weekday Stay promotion</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#FAF6EE]/60 uppercase mb-2">
                    Adults
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.adults}
                    onChange={e => setFormData(prev => ({ ...prev, adults: Number(e.target.value) }))}
                    className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#FAF6EE] text-base outline-none min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#FAF6EE]/60 uppercase mb-2">
                    Children (Age Below 10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.children}
                    onChange={e => setFormData(prev => ({ ...prev, children: Number(e.target.value) }))}
                    className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#FAF6EE] text-base outline-none min-h-[48px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Stay Details */}
          <div className="bg-[#141B26] rounded-2xl p-4 sm:p-5 border border-[#C9A84C]/20 mb-5">
            <h3 className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">
              2. Stay Details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#FAF6EE]/60 uppercase mb-2">
                    Check-In Date *
                  </label>
                  <input
                    type="date"
                    value={formData.checkInDate}
                    onChange={e => setFormData(prev => ({ ...prev, checkInDate: e.target.value }))}
                    className={`w-full bg-[#0D1117] border rounded-xl px-4 py-3 text-[#FAF6EE] text-base outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all min-h-[48px] ${
                      errors.checkInDate ? "border-[#E63946]" : "border-[#C9A84C]/30 focus:border-[#C9A84C]"
                    }`}
                  />
                  {errors.checkInDate && <p className="text-[#E63946] text-xs mt-1">{errors.checkInDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#FAF6EE]/60 uppercase mb-2">
                    Check-In Time
                  </label>
                  <input
                    type="text"
                    value={formData.checkInTime}
                    onChange={e => setFormData(prev => ({ ...prev, checkInTime: e.target.value }))}
                    placeholder="e.g. 02:00 PM"
                    className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#FAF6EE] text-base outline-none min-h-[48px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#FAF6EE]/60 uppercase mb-2">
                    Check-Out Date *
                  </label>
                  <input
                    type="date"
                    value={formData.checkOutDate}
                    onChange={e => setFormData(prev => ({ ...prev, checkOutDate: e.target.value }))}
                    className={`w-full bg-[#0D1117] border rounded-xl px-4 py-3 text-[#FAF6EE] text-base outline-none focus:ring-1 focus:ring-[#C9A84C] transition-all min-h-[48px] ${
                      errors.checkOutDate ? "border-[#E63946]" : "border-[#C9A84C]/30 focus:border-[#C9A84C]"
                    }`}
                  />
                  {errors.checkOutDate && <p className="text-[#E63946] text-xs mt-1">{errors.checkOutDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#FAF6EE]/60 uppercase mb-2">
                    Check-Out Time
                  </label>
                  <input
                    type="text"
                    value={formData.checkOutTime}
                    onChange={e => setFormData(prev => ({ ...prev, checkOutTime: e.target.value }))}
                    placeholder="e.g. 11:00 AM"
                    className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#FAF6EE] text-base outline-none min-h-[48px]"
                  />
                </div>
              </div>

              {formData.stayDuration && (
                <div className="bg-[#0D1117]/80 p-3.5 rounded-xl border border-[#C9A84C]/15 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <span className="text-[#FAF6EE]/50 font-medium">Auto-Calculated Stay:</span>
                    <strong className="text-[#F0D080] ml-1.5">{formData.stayDuration}</strong>
                  </div>
                  <span className="bg-[#C9A84C]/15 px-2.5 py-1 rounded-full text-[#C9A84C] text-[10px] sm:text-xs font-bold font-mono uppercase">
                    {formData.stayType}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Charges Breakdown */}
          <div className="bg-[#141B26] rounded-2xl p-4 sm:p-5 border border-[#C9A84C]/20 mb-5">
            <h3 className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">
              3. Charges Breakdown
            </h3>

            {/* Mobile View line items (staggered card stack) */}
            <div className="block sm:hidden space-y-3">
              {lineItems.map((item, i) => (
                <div key={item.id} className="bg-[#0D1117] rounded-xl p-3 border border-[#C9A84C]/15">
                  <div className="mb-2">
                    <p className="text-[10px] text-[#FAF6EE]/40 uppercase mb-1">Description</p>
                    <input
                      value={item.description}
                      placeholder="Service description (e.g. Villa Rental)"
                      onChange={e => updateLineItem(i, "description", e.target.value)}
                      className="w-full bg-transparent text-[#FAF6EE] text-base outline-none border-b border-[#C9A84C]/20 pb-2"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 items-end">
                    <div>
                      <p className="text-[10px] text-[#FAF6EE]/40 uppercase mb-1">Qty</p>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={e => updateLineItem(i, "qty", Number(e.target.value))}
                        className="w-full bg-[#141B26] border border-[#C9A84C]/20 rounded-lg px-2 py-2 text-[#FAF6EE] text-center outline-none min-h-[44px]"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#FAF6EE]/40 uppercase mb-1">Rate (₹)</p>
                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={e => updateLineItem(i, "rate", Number(e.target.value))}
                        className="w-full bg-[#141B26] border border-[#C9A84C]/20 rounded-lg px-2 py-2 text-[#FAF6EE] outline-none min-h-[44px]"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#FAF6EE]/40 uppercase mb-1">Amount</p>
                      <p className="text-[#C9A84C] font-bold text-base pb-2 text-right sm:text-left">₹{formatINR(item.amount)}</p>
                    </div>
                  </div>
                  {lineItems.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeLineItem(i)}
                      className="mt-3 text-[#E63946] text-xs font-semibold cursor-pointer active:scale-95"
                    >
                      Remove Item
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop View line items (structured data table) */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-[#C9A84C]/15 mb-3">
              <table className="w-full">
                <thead className="bg-[#0D1117]">
                  <tr>
                    {["DESCRIPTION", "QTY", "RATE (₹)", "AMOUNT", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] text-[#FAF6EE]/50 uppercase tracking-widest font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-[#141B26]">
                  {lineItems.map((item, i) => (
                    <tr key={item.id} className="border-t border-[#C9A84C]/10">
                      <td className="px-4 py-3">
                        <input 
                          type="text"
                          value={item.description} 
                          placeholder="Villa rent, catering, bonfire, laundry, etc."
                          onChange={e => updateLineItem(i, "description", e.target.value)}
                          className="w-full bg-transparent text-[#FAF6EE] text-sm outline-none placeholder-[#FAF6EE]/30" 
                        />
                      </td>
                      <td className="px-4 py-3 w-20">
                        <input 
                          type="number" 
                          min="1" 
                          value={item.qty}
                          onChange={e => updateLineItem(i, "qty", Number(e.target.value))}
                          className="w-full bg-[#0D1117] border border-[#C9A84C]/20 rounded-lg px-2 py-1 text-[#FAF6EE] text-sm text-center outline-none" 
                        />
                      </td>
                      <td className="px-4 py-3 w-32">
                        <input 
                          type="number" 
                          min="0" 
                          value={item.rate}
                          onChange={e => updateLineItem(i, "rate", Number(e.target.value))}
                          className="w-full bg-[#0D1117] border border-[#C9A84C]/20 rounded-lg px-2 py-1 text-[#FAF6EE] text-sm outline-none" 
                        />
                      </td>
                      <td className="px-4 py-3 w-28 text-[#C9A84C] font-bold text-sm">
                        ₹{formatINR(item.amount)}
                      </td>
                      <td className="px-4 py-3 w-10 text-center">
                        {lineItems.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeLineItem(i)} 
                            className="text-[#E63946] hover:text-[#ff4d5a] md:p-1 cursor-pointer transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              type="button" 
              onClick={addLineItem}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[#C9A84C] text-xs sm:text-sm font-semibold hover:text-[#FAF6EE] cursor-pointer"
            >
              <Plus size={16} /> Add Line Item
            </button>
            {errors.lineItems && <p className="text-[#E63946] text-xs mt-1">{errors.lineItems}</p>}
          </div>

          {/* Section 4: Payment & Settings */}
          <div className="bg-[#141B26] rounded-2xl p-4 sm:p-5 border border-[#C9A84C]/20 mb-5 space-y-5">
            <h3 className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest">
              4. Payment & System UPI Configuration
            </h3>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#FAF6EE]/60 uppercase mb-2">
                Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["UPI", "Cash", "Bank Transfer"].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                      formData.paymentMethod === method 
                        ? "bg-[#C9A84C]/20 text-[#C9A84C] border-[#C9A84C]" 
                        : "bg-[#0D1117] text-[#FAF6EE]/60 border-[#C9A84C]/15"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#C9A84C] uppercase mb-2">
                UPI ID (Required for QR payload generation)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, upiId: e.target.value }));
                    setUpiSaved(false);
                  }}
                  placeholder="e.g. kingsdiamond@okaxis"
                  className="flex-1 bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#FAF6EE] text-base outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveDefaultUpi}
                  disabled={upiSaving}
                  className="px-4 py-3 bg-[#141B26] border border-[#C9A84C]/30 hover:border-[#C9A84C] rounded-xl text-[#C9A84C] text-xs font-bold whitespace-nowrap min-h-[48px] active:scale-95 transition-all cursor-pointer"
                >
                  {upiSaving ? "Saving..." : upiSaved ? "✓ Saved" : "Save Default"}
                </button>
              </div>
              <p className="text-[#FAF6EE]/40 text-xs mt-1">
                Tap "Save Default" to persist this UPI ID in the cloud database for future bills.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#FAF6EE]/60 uppercase mb-2">
                Advance Deposit Received (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.advanceReceived}
                onChange={e => {
                  const val = Number(e.target.value);
                  setFormData(prev => ({ ...prev, advanceReceived: val }));
                  setFullyPaid(val >= subtotal);
                }}
                className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#FAF6EE] text-base outline-none min-h-[48px]"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const newVal = !fullyPaid;
                setFullyPaid(newVal);
                setFormData(prev => ({
                  ...prev,
                  advanceReceived: newVal ? subtotal : 0,
                }));
              }}
              className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all ${
                fullyPaid
                  ? "bg-gradient-to-r from-[#27c281] to-[#52e0a0] text-[#0D1117]"
                  : "border-2 border-dashed border-[#C9A84C]/30 text-[#FAF6EE]/60 bg-[#0D1117]"
              }`}
            >
              {fullyPaid ? "✅ Fully Paid — Entire sum received" : "Mark as Fully Paid (Zero Balance Due)"}
            </button>
          </div>

          {/* Section 5: Owner's Private Notes */}
          <div className="bg-[#141B26] rounded-2xl p-4 sm:p-5 border border-[#C9A84C]/20 mb-5">
            <h3 className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest mb-4">
              5. Internal Notes
            </h3>
            <textarea
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Guest requested 2 hours late checkout. Allowed due to off-season schedules."
              rows={3}
              className="w-full bg-[#0D1117] border border-[#C9A84C]/30 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#FAF6EE] text-base outline-none placeholder-[#FAF6EE]/30"
            />
          </div>

          {/* Summary Sticky Bottom Panel (Mobile sticky, desktop flexbox footer) */}
          <div className="fixed bottom-0 left-0 right-0 sm:static bg-[#0D1117]/95 backdrop-blur-sm border-t sm:border-t-0 sm:border border-[#C9A84C]/30 sm:rounded-2xl p-4 sm:p-5 z-50 mt-6 shadow-2xl">
            <div className="grid grid-cols-2 gap-y-1.5 text-xs sm:text-sm mb-3">
              <span className="text-[#FAF6EE]/50">Subtotal Charges</span>
              <span className="text-[#FAF6EE] font-bold text-right">₹{formatINR(subtotal)}</span>
              <span className="text-[#FAF6EE] font-bold border-t border-[#C9A84C]/10 pt-1.5">Total Amount</span>
              <span className="text-[#FAF6EE] font-extrabold text-right border-t border-[#C9A84C]/10 pt-1.5">₹{formatINR(subtotal)}</span>
              {formData.advanceReceived > 0 && (
                <>
                  <span className="text-[#27c281]">Advance Received</span>
                  <span className="text-[#27c281] font-bold text-right">−₹{formatINR(formData.advanceReceived)}</span>
                </>
              )}
              <span className="text-[#FAF6EE] font-black uppercase text-xs tracking-wide self-center">Balance Due</span>
              <span className="text-[#C9A84C] text-xl sm:text-2xl font-black text-right">₹{formatINR(balanceDue)}</span>
            </div>

            {errors.submit && <p className="text-[#E63946] text-xs mb-3 text-center">{errors.submit}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#F0D080] text-[#0D1117] font-bold rounded-xl text-sm sm:text-base disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer focus:ring-2 focus:ring-[#C9A84C]"
            >
              {saving ? (
                <>
                  <span className="w-5 h-5 border-2 border-[#0D1117] border-t-transparent rounded-full animate-spin" />
                  Generating Receipt...
                </>
              ) : (
                "Generate & Download Invoice PDF →"
              )}
            </button>
          </div>

          {/* Spacer for sticky overlay on mobile */}
          <div className="h-40 sm:hidden" />
        </form>
      )}

      {currentInvoice && (
        <div style={{ position: "fixed", top: "-9999px", left: "-9999px", width: "1200px", zIndex: -1, pointerEvents: "none" }}>
          <InvoiceTemplate ref={invoiceRef} data={currentInvoice} />
        </div>
      )}
    </div>
  );
}
