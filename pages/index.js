import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { UploadCloud, X, FileSpreadsheet } from 'lucide-react'; // Tambahkan X & FileSpreadsheet

export default function Dashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [unitsData, setUnitsData] = useState([]);
  
  // --- STATE MODAL IMPORT ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [summary, setSummary] = useState({ 
    open: 0, pctOpen: 0,
    progress: 0, pctProgress: 0,
    closed: 0, pctClosed: 0,
    total: 0
  });
  const [lastUpdate, setLastUpdate] = useState('');

  // SKEMA WARNA
  const COLORS = {
    new: '#ef4444',      // Merah
    open: '#f59e0b',     // Kuning/Orange
    progress: '#10b981', // Hijau
    closed: '#8b5cf6',   // Ungu
    empty: '#e5e7eb'     // Abu-abu background chart
  };

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      router.push('/loginPage/login');
    } else {
      setIsAuthorized(true);
      fetchHazardStatistics();
      setLastUpdate(new Date().toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      }).replace(/\./g, '/'));
    }
  }, [router]);

  const fetchHazardStatistics = async () => {
    try {
      let allData = [];
      let from = 0;
      let to = 999;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('hazards')
          .select('unit, status')
          .range(from, to);

        if (error) throw error;
        if (data && data.length > 0) {
          allData = [...allData, ...data];
          from += 1000;
          to += 1000;
        } else {
          hasMore = false;
        }
      }

      const grandTotal = allData.length;
      if (grandTotal === 0) return;

      const tOpen = allData.filter(d => d.status === 'Open').length;
      const tProg = allData.filter(d => d.status === 'Work In Progress').length;
      const tClosed = allData.filter(d => d.status === 'Closed').length;
      
      setSummary({
        open: tOpen,
        pctOpen: Math.round((tOpen / grandTotal) * 100) || 0,
        progress: tProg,
        pctProgress: Math.round((tProg / grandTotal) * 100) || 0,
        closed: tClosed,
        pctClosed: Math.round((tClosed / grandTotal) * 100) || 0,
        total: grandTotal
      });

      const allUniqueUnits = [...new Set(allData.map(item => item.unit?.trim()))].filter(Boolean);

      const formattedUnits = allUniqueUnits.map(unitName => {
        const unitItems = allData.filter(d => d.unit?.trim() === unitName);
        const total = unitItems.length;
        const closed = unitItems.filter(d => d.status === 'Closed').length;
        const progress = unitItems.filter(d => d.status === 'Work In Progress').length;
        const open = unitItems.filter(d => d.status === 'Open').length;
        
        const completion = total > 0 ? Math.round((closed / total) * 100) : 0;

        return {
          name: unitName,
          total,
          completion,
          chartData: [
            { name: 'Open', value: open, color: COLORS.open },
            { name: 'Progress', value: progress, color: COLORS.progress },
            { name: 'Closed', value: closed, color: COLORS.closed }
          ]
        };
      });

      setUnitsData(formattedUnits.sort((a, b) => a.name.localeCompare(b.name)));

    } catch (error) {
      console.error("Error dashboard:", error.message);
    }
  };

  // --- HANDLER FILE ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    
    // SIMULASI UPLOAD (Ganti dengan logika upload Supabase/API Anda)
    console.log("Mengupload file:", selectedFile.name);
    
    setTimeout(() => {
        setIsUploading(false);
        alert(`File ${selectedFile.name} berhasil diupload!`);
        setIsModalOpen(false); // Tutup modal
        setSelectedFile(null); // Reset file
        // fetchHazardStatistics(); // Opsional: Refresh data
    }, 1500);
  };

  if (!isAuthorized) return <div className="h-screen bg-[#F8F9FA]"></div>;

  return (
    <Layout>
      {/* Container FLUID (Lebar Penuh) */}
      <div className="w-full px-6 py-4">
        
        {/* --- HEADER PAGE --- */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-black">Dashboard</h1>
            
            {/* BUTTON IMPORT (Membuka Modal) */}
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-[#005DAA] hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-all text-sm"
            >
                <UploadCloud size={16} />
                Import File
            </button>
        </div>

        {/* --- KOTAK PUTIH UTAMA (RINGKASAN) --- */}
        <div className="w-full max-w-[1050px] mr-auto bg-white rounded-[1.5rem] p-8 shadow-sm mb-12 border border-gray-100">
            {/* Header Dalam Kotak */}
            <div className="flex justify-between items-start mb-8 border-b border-gray-50 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-[#005DAA] mb-2">Hazard Report</h2>
                    <span className="border border-gray-300 text-gray-500 text-xs px-3 py-1 rounded-full font-medium">
                        KAI DAOP 4
                    </span>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">
                        Last Updated : <br/> {lastUpdate}
                    </p>
                </div>
                
                <div className="text-right">
                    <span className="text-6xl font-black text-gray-800 tracking-tight">
                        {summary.total}
                    </span>
                    <p className="text-sm text-gray-500 font-medium mt-1">Total Hazard</p>
                </div>
            </div>

            {/* Grafik Ringkasan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <BigGauge label="New Hazard" pct={summary.pctOpen} color={COLORS.new} />
                <BigGauge label="Open Hazard" pct={summary.pctOpen} color={COLORS.open} />
                <BigGauge label="In Progress" pct={summary.pctProgress} color={COLORS.progress} />
                <BigGauge label="Close Hazard" pct={summary.pctClosed} color={COLORS.closed} />
            </div>
        </div>

        {/* --- UNIT ANALYTICS (GRID BAWAH) --- */}
        <div className="w-full">
            <h3 className="text-xl font-bold text-gray-700 mb-6 border-l-4 border-[#005DAA] pl-3">
                Detail Unit ({unitsData.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-12">
                {unitsData.map((unit, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-50 hover:shadow-lg transition-all duration-300">
                    <h4 className="text-base font-bold text-gray-700 mb-4 h-6 truncate uppercase">
                        {unit.name}
                    </h4>
                    <div className="relative w-full h-40 flex justify-center items-end overflow-hidden mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={unit.chartData}
                            cx="50%" cy="100%"
                            startAngle={180} endAngle={0}
                            innerRadius={70} outerRadius={100}
                            paddingAngle={2} dataKey="value" stroke="none"
                        >
                            {unit.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-0 mb-2 flex flex-col items-center">
                        <span className="text-3xl font-black text-[#005DAA] leading-none">
                            {unit.completion}%
                        </span>
                        <span className="text-xs text-gray-400 font-bold mt-1">TL%</span>
                    </div>
                    </div>
                    <div className="flex justify-between items-end px-2 gap-2">
                        {/* Open */}
                        <div className="flex gap-2 items-center">
                            <div className="w-1.5 h-8 bg-[#f59e0b] rounded-full"></div>
                            <div>
                                <span className="text-[10px] text-gray-400 block uppercase font-bold">Open</span>
                                <span className="text-lg font-bold text-gray-800 leading-none">{unit.chartData[0].value}</span>
                            </div>
                        </div>
                        {/* Progress */}
                        <div className="flex gap-2 items-center">
                            <div className="w-1.5 h-8 bg-[#10b981] rounded-full"></div>
                            <div>
                                <span className="text-[10px] text-gray-400 block uppercase font-bold">Prog</span>
                                <span className="text-lg font-bold text-gray-800 leading-none">{unit.chartData[1].value}</span>
                            </div>
                        </div>
                        {/* Close */}
                        <div className="flex gap-2 items-center">
                            <div className="w-1.5 h-8 bg-[#8b5cf6] rounded-full"></div>
                            <div>
                                <span className="text-[10px] text-gray-400 block uppercase font-bold">Close</span>
                                <span className="text-lg font-bold text-gray-800 leading-none">{unit.chartData[2].value}</span>
                            </div>
                        </div>
                        {/* Total */}
                        <div className="flex gap-2 items-center border-l pl-4 border-gray-100">
                            <div className="w-1.5 h-8 bg-gray-400 rounded-full"></div>
                            <div>
                                <span className="text-[10px] text-gray-400 block uppercase font-bold">Total</span>
                                <span className="text-lg font-bold text-gray-800 leading-none">{unit.total}</span>
                            </div>
                        </div>
                    </div>
                </div>
                ))}
            </div>
        </div>

      </div>

      {/* --- MODAL POP-UP IMPORT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
            {/* Kotak Modal */}
            <div className="bg-white rounded-[1.5rem] w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                
                {/* Header Modal */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Import Data</h3>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Area Upload (Dashed) */}
                <div className="relative group mb-6">
                    <input 
                        type="file" 
                        accept=".xlsx, .xls, .csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`border-2 border-dashed rounded-2xl h-52 flex flex-col items-center justify-center transition-all duration-300 ${selectedFile ? 'border-[#005DAA] bg-blue-50/50' : 'border-gray-300 bg-gray-50 group-hover:bg-gray-100'}`}>
                        {selectedFile ? (
                            <>
                                <FileSpreadsheet size={48} className="text-[#005DAA] mb-3" />
                                <p className="text-sm font-bold text-[#005DAA] truncate max-w-[80%] text-center px-4">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                            </>
                        ) : (
                            <>
                                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                    <UploadCloud size={32} className="text-[#005DAA]" />
                                </div>
                                <p className="text-sm font-bold text-gray-700">Pilih File Excel Anda</p>
                                <p className="text-xs text-gray-400 mt-1">Support: .xlsx, .csv</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                        className={`flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all flex justify-center items-center gap-2 ${!selectedFile ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#005DAA] hover:bg-blue-800 shadow-lg hover:shadow-xl'}`}
                    >
                        {isUploading ? 'Mengupload...' : 'Upload File'}
                    </button>
                </div>
            </div>
        </div>
      )}

    </Layout>
  );
}

// KOMPONEN GAUGE CARD BESAR
function BigGauge({ label, pct, color }) {
    const data = [
        { value: pct, color: color },
        { value: 100 - pct, color: '#e5e7eb' }
    ];

    return (
        <div className="flex flex-col items-center">
            <h3 className="text-md font-bold text-black mb-3">{label}</h3>
            <div className="relative w-48 h-28 flex justify-center items-end overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%" cy="100%"
                            startAngle={180} endAngle={0}
                            innerRadius={60} outerRadius={85}
                            paddingAngle={0} dataKey="value" stroke="none"
                        >
                            <Cell fill={data[0].color} />
                            <Cell fill={data[1].color} />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/* Persentase di Tengah */}
                <div className="absolute bottom-0 mb-2 text-center">
                    <span className="text-xl font-bold text-gray-800">{pct}%</span>
                </div>
            </div>
        </div>
    );
}