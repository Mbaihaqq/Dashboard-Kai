import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';
import { Check, X, User, Search } from 'lucide-react';

export default function AdminApproval() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // State untuk Search Bar

  useEffect(() => { 
    fetchPendingUsers(); 
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
        // KEMBALI KE LOGIKA ASLI: Hanya ambil yang status = 'pending'
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('status', 'pending');
            
        if (error) throw error;
        setUsers(data || []);
    } catch (error) {
        console.error("Gagal load user:", error.message);
    } finally {
        setLoading(false);
    }
  };

  const handleAction = async (userId, newStatus) => {
    if (!confirm(newStatus === 'aktif' ? "Terima akun ini?" : "Tolak akun ini?")) return;
    
    try {
      if (newStatus === 'aktif') {
        // Update status jadi aktif
        const { error } = await supabase.from('profiles').update({ status: 'aktif' }).eq('id', userId);
        if (error) throw error;
      } else {
        // Hapus data (Tolak)
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) throw error;
      }
      // Refresh list setelah aksi
      fetchPendingUsers();
    } catch (e) { 
        alert("Gagal memproses: " + e.message); 
    }
  };

  // --- FITUR SEARCH BAR ---
  // Memfilter data 'pending' yang sudah diambil berdasarkan ketikan di Search Bar
  const filteredUsers = users.filter(user => {
    const lowerTerm = searchTerm.toLowerCase();
    return (
        (user.username && user.username.toLowerCase().includes(lowerTerm)) ||
        (user.nip && user.nip.toLowerCase().includes(lowerTerm)) ||
        (user.position && user.position.toLowerCase().includes(lowerTerm))
    );
  });

  return (
    // PENTING: Props onSearch agar Header bisa kirim teks ke sini
    <Layout onSearch={setSearchTerm}>
      <div className="w-full px-6 py-6">
        
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-1">Permohonan Create Account</h1>
            <p className="text-sm text-gray-500">
                Daftar pengguna yang menunggu persetujuan akses. 
                {searchTerm && <span className="font-bold text-[#005DAA]"> (Hasil Pencarian: {filteredUsers.length})</span>}
            </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#005DAA] text-white uppercase text-xs font-bold">
                    <tr>
                        <th className="px-6 py-4">Username</th>
                        <th className="px-6 py-4">NIP</th>
                        <th className="px-6 py-4">Jabatan</th>
                        <th className="px-6 py-4 text-center">Status / Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-[#4B5563] font-medium">
                    {loading ? (
                        <tr><td colSpan="4" className="text-center py-10 text-gray-400">Memuat data...</td></tr>
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-bold text-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-[#005DAA] flex items-center justify-center">
                                            <User size={16} />
                                        </div>
                                        {user.username}
                                    </div>
                                </td>
                                <td className="px-6 py-4">{user.nip || '-'}</td>
                                <td className="px-6 py-4">{user.position || '-'}</td>
                                <td className="px-6 py-4 flex justify-center gap-3">
                                    <button 
                                        onClick={() => handleAction(user.id, 'aktif')} 
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-green-600 transition shadow-sm"
                                    >
                                        <Check size={14} /> Terima
                                    </button>
                                    <button 
                                        onClick={() => handleAction(user.id, 'tolak')} 
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-red-600 transition shadow-sm"
                                    >
                                        <X size={14} /> Tolak
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center py-12 flex flex-col items-center justify-center text-gray-400">
                                <Search size={32} className="mb-2 opacity-20"/>
                                <p>Tidak ada permohonan {searchTerm ? 'yang cocok' : 'tertunda'}.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </Layout>
  );
}