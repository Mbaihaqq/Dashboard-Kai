import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';
import { Check, X } from 'lucide-react';

export default function AdminApproval() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPendingUsers(); }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').eq('status', 'pending');
    if (!error) setUsers(data);
    setLoading(false);
  };

  const handleAction = async (userId, newStatus) => {
    if (!confirm(newStatus === 'aktif' ? "Terima akun ini?" : "Tolak akun ini?")) return;
    try {
      if (newStatus === 'aktif') {
        await supabase.from('profiles').update({ status: 'aktif' }).eq('id', userId);
      } else {
        await supabase.from('profiles').delete().eq('id', userId);
      }
      fetchPendingUsers();
    } catch (e) { alert(e.message); }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-black mb-1">Permohonan Create Account [cite: 685]</h1>
      <p className="text-sm text-gray-500 mb-8">Tabel Daftar Permohonan Create Account [cite: 686]</p>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#005DAA] text-white uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4">Username [cite: 688]</th>
              <th className="px-6 py-4">NIP [cite: 688]</th>
              <th className="px-6 py-4">Jabatan</th>
              <th className="px-6 py-4 text-center">Status / Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[#4B5563] font-bold">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-10">Memuat data...</td></tr>
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">{user.username}</td>
                  <td className="px-6 py-4">{user.nip}</td>
                  <td className="px-6 py-4">{user.position}</td>
                  <td className="px-6 py-4 flex justify-center gap-3">
                    <button onClick={() => handleAction(user.id, 'aktif')} className="bg-green-500 text-white px-4 py-1.5 rounded-lg flex items-center gap-1 text-xs hover:bg-green-600 transition">
                      <Check size={14} /> Terima
                    </button>
                    <button onClick={() => handleAction(user.id, 'tolak')} className="bg-red-500 text-white px-4 py-1.5 rounded-lg flex items-center gap-1 text-xs hover:bg-red-600 transition">
                      <X size={14} /> Tolak
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center py-10">Tidak ada permohonan tertunda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}