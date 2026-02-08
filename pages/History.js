import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { 
  ArrowLeft, Search, FileSpreadsheet,
  User, Clock 
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

  // Filter Search (Case Insensitive)
  const filteredData = historyData.filter(item => 
    (item.admin_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.file_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Helper Format Tanggal & Waktu
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <Layout>
      <div className="w-full px-4 py-6 bg-[#F8F9FA] min-h-screen">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button 
                    onClick={() => router.push('/')} 
                    className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-[#005DAA] hover:border-[#005DAA] transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">Riwayat Penginputan</h1>
                    <p className="text-xs text-gray-500">Log aktivitas impor data hazard.</p>
                </div>
            </div>

            {/* SEARCH BAR (Professional Style) */}
            <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                </div>
                <input 
                    type="text" 
                    placeholder="Cari admin atau nama file..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#005DAA] focus:border-[#005DAA] sm:text-sm transition-all shadow-sm"
                />
            </div>
        </div>

        {/* --- TABLE CARD --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Waktu Upload
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Uploaded By
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Nama File
                            </th>
                            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Total Data
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                    <span className="mt-2 block text-xs">Memuat data...</span>
                                </td>
                            </tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((row, idx) => {
                                const { date, time } = formatDate(row.upload_date);
                                return (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        
                                        {/* Waktu */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">{date}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <Clock size={12} /> {time} WIB
                                            </div>
                                        </td>

                                        {/* Admin (Uploaded By) */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                                                    <User size={14} />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{row.admin_name || 'Admin'}</div>
                                                    <div className="text-xs text-gray-500">Authorized</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* File */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FileSpreadsheet size={16} className="text-green-600 flex-shrink-0" />
                                                <span className="text-sm text-gray-600 truncate max-w-[250px]" title={row.file_name}>
                                                    {row.file_name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Total Data */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#005DAA] border border-blue-100">
                                                {row.total_rows} Rows
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500">
                                    Tidak ada data riwayat yang ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Footer Summary */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                    Menampilkan <span className="font-bold">{filteredData.length}</span> data
                </span>
            </div>
        </div>

      </div>
    </Layout>
  );
}