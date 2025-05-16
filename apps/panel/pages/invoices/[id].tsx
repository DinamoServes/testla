import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const statusColors = {
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function InvoiceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchInvoice() {
    setLoading(true);
    try {
      const res = await axios.get(`/api/invoices/${id}`);
      setInvoice(res.data.data.invoice);
    } catch (e) {
      setError('Failed to load invoice.');
    }
    setLoading(false);
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!invoice) return <div className="p-8">Invoice not found.</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Invoice Details</h1>
      <div className="mb-4">
        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[invoice.status]}`}>{invoice.status}</span>
      </div>
      <div className="mb-2"><b>ID:</b> <span className="font-mono text-xs">{invoice._id}</span></div>
      <div className="mb-2"><b>Amount:</b> {invoice.amount} {invoice.currency}</div>
      <div className="mb-2"><b>Description:</b> {invoice.description}</div>
      <div className="mb-2"><b>Created:</b> {new Date(invoice.createdAt).toLocaleString()}</div>
      <div className="mb-2"><b>Paid At:</b> {invoice.paidAt ? new Date(invoice.paidAt).toLocaleString() : '-'}</div>
      <div className="mb-2"><b>Cancelled At:</b> {invoice.cancelledAt ? new Date(invoice.cancelledAt).toLocaleString() : '-'}</div>
      {invoice.adminNotes && (
        <div className="mb-2"><b>Admin Notes:</b> <span className="whitespace-pre-line">{invoice.adminNotes}</span></div>
      )}
    </div>
  );
} 