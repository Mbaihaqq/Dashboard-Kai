import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { 
  ArrowLeft, Search, FileSpreadsheet, Calendar, 
  User, Download, ChevronLeft, ChevronRight, Filter 
} from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('upload_history')
            .select('*')
            .order('upload_date', { ascending: false });
        
        if (error) throw error;
        setHistoryData(data);
      } catch (error) {
        console.error("Gagal ambil history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Filter Search Logic
  const filteredData = historyData.filter(item => 
    (item.admin_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.file_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Helper Format Tanggal
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Helper Avatar Initials
  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : 'AD';
  };

  return (
    <Layout>
      <div className="w-full px-2 py-4">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => router.push('/')} 
                    className="group p-2.5 bg-white rounded-xl border border-gray-200 hover:border-[#005DAA] hover:text-[#005DAA] transition-all shadow-sm"
                >
                    <ArrowLeft size={20} className="text-gray-500 group-hover:text-[#005DAA]" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Riwayat Penginputan</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor aktivitas upload data hazard.</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm">
                    <Download size={18} /> Export Log
                </button>
            </div>
        </div>

        {/* --- CONTENT CARD --- */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Toolbar: Search & Filter */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 bg-white">
                <div className="relative w-full sm:w-96">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Cari admin atau nama file..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#005DAA]/20 focus:bg-white transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 bg-gray-50 text-gray-600 px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all">
                    <Filter size={18} /> Filter Tanggal
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5">Admin / User</th>
                            <th className="px-6 py-5">Aktivitas Upload</th>
                            <th className="px-6 py-5">Jumlah Data</th>
                            <th className="px-6 py-5 text-right">Waktu</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005DAA]"></div>
                                        <span className="text-gray-400 font-medium">Memuat data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((row, idx) => {
                                const { date, time } = formatDate(row.upload_date);
                                return (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                                        
                                        {/* Kolom 1: Admin Info */}
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-[#005DAA] flex items-center justify-center font-bold text-sm shadow-sm border border-blue-100">
                                                    {getInitials(row.admin_name)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{row.admin_name || 'Admin'}</p>
                                                    <p className="text-xs text-gray-400">Authorized Admin</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Kolom 2: File Info */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                                    <FileSpreadsheet size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-700 truncate max-w-[250px]" title={row.file_name}>
                                                        {row.file_name}
                                                    </p>
                                                    <p className="text-xs text-green-600 font-medium">Excel File Uploaded</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Kolom 3: Stats */}
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center gap-2 bg-blue-50 text-[#005DAA] px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100">
                                                <span className="w-2 h-2 rounded-full bg-[#005DAA]"></span>
                                                {row.total_rows} Data Masuk
                                            </span>
                                        </td>

                                        {/* Kolom 4: Waktu */}
                                        <td className="px-6 py-5 text-right">
                                            <p className="font-bold text-gray-700">{date}</p>
                                            <p className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-1">
                                                <Calendar size={10} /> {time} WIB
                                            </p>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className="bg-gray-50 p-6 rounded-full">
                                            <Search size={40} className="text-gray-300"/>
                                        </div>
                                        <div>
                                            <p className="text-gray-800 font-bold">Data tidak ditemukan</p>
                                            <p className="text-gray-400 text-sm mt-1">Coba kata kunci pencarian lain.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer (Kosmetik) */}
            <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="text-sm text-gray-500 font-medium">
                    Menampilkan <strong>{filteredData.length}</strong> riwayat
                </span>
                <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-200 text-gray-400 disabled:opacity-50 transition-colors" disabled>
                        <ChevronLeft size={20} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

        </div>
      </div>
    </Layout>
  );
}