// pages/tickets/index.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchTicketsAndRole();
  }, []);

  const fetchTicketsAndRole = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role === 'admin') setIsAdmin(true);
      }

      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;
      
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    } catch (error) {
      alert("Gagal mengubah status: " + error.message);
    }
  };

  // Logika Filter: Cari berdasarkan Nama, Nomor Telepon, atau Email
  const filteredTickets = tickets.filter((ticket) => {
    const term = searchTerm.toLowerCase();
    return (
      ticket.customer_name?.toLowerCase().includes(term) ||
      ticket.phone_number?.toLowerCase().includes(term) ||
      ticket.email?.toLowerCase().includes(term)
    );
  });

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-black font-sans">Permasalahan Tiket</h1>
        <Link href="/tickets/create">
          <button className="bg-[#005DAA] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition shadow-sm">
            Input Data
          </button>
        </Link>
      </div>

      <h2 className="text-lg font-bold text-black mb-4 font-sans">Tabel Progres Permasalahan Tiket</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 flex justify-end">
          <div className="relative w-full md:w-64">
             <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
               <Search size={18} />
             </span>
             <input 
               type="text" 
               placeholder="Cari nama, telp, atau email..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-[#F9FAFB] border-none text-[#4B5563] text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5" 
             />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-normal">Customer Name</th>
                <th className="px-6 py-4 font-normal">Phone Number</th>
                <th className="px-6 py-4 font-normal">Email</th>
                <th className="px-6 py-4 font-normal text-right pr-10">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-10 text-[#4B5563] font-bold">Memuat data...</td></tr>
              ) : filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="bg-white hover:bg-gray-50 transition">
                    <td className="px-6 py-5 font-bold text-[#4B5563]">{ticket.customer_name}</td>
                    <td className="px-6 py-5 font-bold text-[#4B5563]">{ticket.phone_number}</td>
                    <td className="px-6 py-5 font-bold text-[#4B5563]">{ticket.email}</td>
                    <td className="px-6 py-5 flex justify-end pr-6">
                      
                      <select
                        value={ticket.status}
                        onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                        className={`px-2 py-1.5 rounded-md text-xs font-bold border outline-none cursor-pointer transition-colors
                          ${ticket.status === 'Selesai' 
                            ? 'bg-[#D1FAE5] text-[#065F46] border-[#D1FAE5]' 
                            : 'bg-[#FEE2E2] text-[#991B1B] border-[#FEE2E2]' 
                          }`}
                      >
                        <option value="Belum">Belum</option>
                        <option value="Selesai">Selesai</option>
                      </select>

                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center py-10 text-[#4B5563] font-bold">Data tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}