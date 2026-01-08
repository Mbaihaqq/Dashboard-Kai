// pages/target/index.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { Trash2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function TargetRevenue() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTargets = async () => {
    try {
      setLoading(true);
      // Supabase otomatis hanya mengambil data milik user yang login karena RLS aktif
      const { data, error } = await supabase
        .from('daily_targets')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setTargets(data || []);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus data ini?");
    if (confirmDelete) {
      try {
        const { error } = await supabase
          .from('daily_targets')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchTargets();
      } catch (error) {
        alert("Gagal menghapus data: " + error.message);
      }
    }
  };

  const filteredTargets = targets.filter((item) => {
    const formattedDate = new Date(item.date).toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    }).toLowerCase();
    return formattedDate.includes(searchTerm.toLowerCase());
  });

  return (
    <Layout>
      <div className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-black mb-1">Target Pendapatan</h1>
                <p className="text-sm text-gray-500">Tabel Data Target Pendapatan & Data Aktual Lapangan</p>
            </div>
            
            <Link href="/target/input">
                <button className="bg-[#005DAA] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition shadow-sm">
                    Input Data
                </button>
            </Link>
        </div>

        <div className="mb-4 flex justify-end">
          <div className="relative w-full md:w-64">
             <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
               <Search size={18} />
             </span>
             <input 
               type="text" 
               placeholder="Cari Tanggal..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-white border border-gray-200 text-[#4B5563] text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 shadow-sm" 
             />
          </div>
        </div>

        <div className="w-full">
            {/* Header Tabel */}
            <div className="bg-[#005DAA] text-white p-4 rounded-lg shadow-sm grid grid-cols-12 gap-4 items-center font-bold text-sm md:text-base text-center">
                <div className="col-span-1">NO</div>
                <div className="col-span-3 text-center md:text-left">Tanggal</div>
                <div className="col-span-4 text-center">Target Pendapatan</div>
                <div className="col-span-3 text-center">Pendapatan Aktual</div>
                <div className="col-span-1 text-center">Aksi</div>
            </div>

            {/* List Data */}
            <div className="space-y-3 mt-3">
                {loading ? (
                    <p className="text-center py-10 text-[#4B5563] font-bold">Memuat data...</p>
                ) : filteredTargets.length > 0 ? (
                    filteredTargets.map((item, index) => (
                        <div 
                            key={item.id} 
                            className="bg-white border border-[#005DAA] rounded-lg p-4 grid grid-cols-12 gap-4 items-center shadow-sm hover:shadow-md transition-shadow text-center"
                        >
                            <div className="col-span-1 font-bold text-[#4B5563]">{index + 1}</div>
                            <div className="col-span-3 text-[#4B5563] font-bold text-center md:text-left">
                                {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            
                            <div className="col-span-4 font-bold text-[#F26522] text-lg">
                                Rp {item.target_revenue?.toLocaleString('id-ID')},-
                            </div>
                            <div className="col-span-3 font-bold text-[#F26522] text-lg">
                                Rp {item.actual_revenue?.toLocaleString('id-ID')},-
                            </div>

                            <div className="col-span-1 flex justify-center">
                                <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="text-[#4B5563] hover:text-red-500 transition p-2"
                                >
                                    <Trash2 size={22} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center py-10 text-[#4B5563] font-bold">Data tidak ditemukan.</p>
                )}
            </div>
        </div>
      </div>
    </Layout>
  );
}