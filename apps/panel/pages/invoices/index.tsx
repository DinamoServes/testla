import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

type Invoice = {
  _id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'unpaid' | 'cancelled';
  createdAt: string;
};

const statusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function MyInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    setLoading(true);
    const res = await axios.get('/api/invoices/my');
    setInvoices(res.data.data.invoices);
    setLoading(false);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Invoices</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8">No invoices found.</td></tr>
            ) : (
              invoices.map(inv => (
                <tr key={inv._id} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">{inv._id}</td>
                  <td className="px-4 py-2">{inv.amount} {inv.currency}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[inv.status]}`}>{inv.status}</span>
                  </td>
                  <td className="px-4 py-2">{new Date(inv.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <Link href={`/invoices/${inv._id}`} className="text-blue-600 hover:underline">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 