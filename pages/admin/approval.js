import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';
import { Check, X, User, Clock } from 'lucide-react';

export default function AdminApproval() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // State Search

  useEffect(() => { fetchPendingUsers(); }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    // Mengambil status 'pending' (sesuaikan dengan DB Anda)
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
    if (!error) setUsers(data || []);
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

  // --- LOGIKA FILTER SEARCH ---
  const filteredUsers = users.filter(user => 
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.nip && user.nip.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.position && user.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    // PENTING: Passing setSearchTerm agar Search Bar Header berfungsi di halaman ini
    <Layout onSearch={setSearchTerm}>
      <div className="w-full px-6 py-4">
        
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-1">Permohonan Create Account</h1>
            <p className="text-sm text-gray-500">Daftar pengguna yang menunggu persetujuan akses.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#005DAA] text-white uppercase text-xs font-bold">
                <tr>
                <th className="px-6 py-4">Username / Email</th>
                <th className="px-6 py-4">NIP</th>
                <th className="px-6 py-4">Jabatan</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
                {loading ? (
                    <tr><td colSpan="5" className="text-center py-10 text-gray-400">Memuat data...</td></tr>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                            <td className="px-6 py-4 font-bold">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p>{user.username}</p>
                                        <p className="text-xs text-gray-400 font-normal">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">{user.nip || '-'}</td>
                            <td className="px-6 py-4">{user.position || '-'}</td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                                    ${user.status === 'aktif' ? 'bg-green-100 text-green-600' : 
                                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                                    {user.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 flex justify-center gap-3">
                                {user.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleAction(user.id, 'aktif')} className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition" title="Terima">
                                            <Check size={18} />
                                        </button>
                                        <button onClick={() => handleAction(user.id, 'tolak')} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition" title="Tolak">
                                            <X size={18} />
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan="5" className="text-center py-10 text-gray-400">Tidak ada data yang cocok dengan "{searchTerm}".</td></tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </Layout>
  );
}