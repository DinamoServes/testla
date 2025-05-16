import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

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
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
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
      setNotes(res.data.data.invoice.adminNotes || '');
    } catch (e) {
      setError('Failed to load invoice.');
    }
    setLoading(false);
  }

  async function markAsPaid() {
    setSaving(true);
    await axios.patch(`/api/invoices/${id}/pay`);
    await fetchInvoice();
    setSaving(false);
  }
  async function markAsCancelled() {
    setSaving(true);
    await axios.patch(`/api/invoices/${id}/cancel`);
    await fetchInvoice();
    setSaving(false);
  }
  async function saveNotes() {
    setSaving(true);
    await axios.patch(`/api/invoices/${id}/notes`, { adminNotes: notes });
    await fetchInvoice();
    setSaving(false);
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
      <div className="mb-2"><b>User:</b> {invoice.user?.username || invoice.user?.email || 'N/A'}</div>
      <div className="mb-2"><b>Amount:</b> {invoice.amount} {invoice.currency}</div>
      <div className="mb-2"><b>Description:</b> {invoice.description}</div>
      <div className="mb-2"><b>Created:</b> {new Date(invoice.createdAt).toLocaleString()}</div>
      <div className="mb-2"><b>Paid At:</b> {invoice.paidAt ? new Date(invoice.paidAt).toLocaleString() : '-'}</div>
      <div className="mb-2"><b>Cancelled At:</b> {invoice.cancelledAt ? new Date(invoice.cancelledAt).toLocaleString() : '-'}</div>
      {invoice.server && (
        <div className="mb-2">
          <b>Server:</b> <Link href={`/servers/${invoice.server}`} className="text-blue-600 hover:underline">{invoice.server}</Link>
        </div>
      )}
      <div className="my-4 flex gap-2">
        {invoice.status !== 'paid' && (
          <button onClick={markAsPaid} disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Mark as Paid</button>
        )}
        {invoice.status !== 'cancelled' && (
          <button onClick={markAsCancelled} disabled={saving} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Cancel</button>
        )}
      </div>
      <div className="mt-6">
        <label className="block font-semibold mb-1">Admin Notes</label>
        <textarea
          className="w-full border rounded px-2 py-1 min-h-[80px]"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        <button onClick={saveNotes} disabled={saving} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Notes</button>
      </div>
    </div>
  );
} 