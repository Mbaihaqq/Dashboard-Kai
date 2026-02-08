import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Calendar, User, FileSpreadsheet, History as HistoryIcon, Clock } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data saat halaman dibuka
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('upload_history')
            .select('*')
            .order('upload_date', { ascending: false }); // Urutkan dari yang terbaru
        
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

  // Format tanggal biar enak dibaca (Contoh: 12 Feb 2025, 14:30 WIB)
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }) + ' WIB';
  };

  return (
    <Layout>
      <div className="w-full px-6 py-6 min-h-screen bg-[#F8F9FA]">
        
        {/* HEADER & TOMBOL KEMBALI */}
        <div className="flex items-center gap-4 mb-8">
            <button 
                onClick={() => router.push('/')} 
                className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:scale-105 transition-all text-gray-600"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                    <HistoryIcon size={28} className="text-[#005DAA]" />
                    Riwayat Penginputan Data
                </h1>
                <p className="text-sm text-gray-500 font-medium ml-9">Log aktivitas upload file Excel oleh admin.</p>
            </div>
        </div>

        {/* TABEL DATA */}
        <div className="bg-white rounded-[1.5rem] shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#005DAA] text-white uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-5 w-16 text-center">No</th>
                            <th className="px-6 py-5">Waktu Upload</th>
                            <th className="px-6 py-5">Admin / User</th>
                            <th className="px-6 py-5">Nama File</th>
                            <th className="px-6 py-5 text-center">Total Data</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-[#005DAA]"></div>
                                        Memuat data...
                                    </div>
                                </td>
                            </tr>
                        ) : historyData.length > 0 ? (
                            historyData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-blue-50 transition-colors group">
                                    <td className="px-6 py-4 text-center font-medium text-gray-500">{idx + 1}</td>
                                    
                                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                                        <div className="flex items-center gap-2 font-medium">
                                            <Clock size={16} className="text-gray-400 group-hover:text-[#005DAA] transition-colors" />
                                            {formatDate(row.upload_date)}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-gray-700 font-bold">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#005DAA]">
                                                <User size={14} />
                                            </div>
                                            {row.admin_name || 'Admin'}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg w-fit border border-gray-200 group-hover:border-blue-200 transition-colors">
                                            <FileSpreadsheet size={16} className="text-green-600" />
                                            <span className="font-medium truncate max-w-[300px]" title={row.file_name}>
                                                {row.file_name}
                                            </span>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-blue-50 text-[#005DAA] px-3 py-1 rounded-full text-xs font-black border border-blue-100 shadow-sm">
                                            {row.total_rows} Baris
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
                                    <div className="bg-gray-50 p-4 rounded-full">
                                        <HistoryIcon size={32} className="opacity-30"/>
                                    </div>
                                    <p className="font-medium">Belum ada riwayat penginputan data.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </Layout>
  );
}