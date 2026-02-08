import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { UploadCloud, X, FileSpreadsheet } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [unitsData, setUnitsData] = useState([]);
  
  // --- STATE MODAL & LAST UPDATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('-'); // Default strip dulu

  const [summary, setSummary] = useState({ 
    open: 0, pctOpen: 0,
    progress: 0, pctProgress: 0,
    closed: 0, pctClosed: 0,
    total: 0
  });

  // SKEMA WARNA
  const COLORS = {
    new: '#ef4444',      // Merah
    open: '#f59e0b',     // Kuning/Orange
    progress: '#10b981', // Hijau
    closed: '#8b5cf6',   // Ungu
    empty: '#e5e7eb'     // Abu-abu background chart
  };

  // FUNGSI FORMAT TANGGAL (Contoh: 19/02/2026 - 15:30)
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/\./g, ':'); // Ganti pemisah waktu jadi titik dua jika perlu
  };

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      router.push('/loginPage/login');
    } else {
      setIsAuthorized(true);
      
      // 1. Cek apakah ada tanggal tersimpan di LocalStorage (History upload terakhir)
      const savedDate = localStorage.getItem('last_hazard_update');
      if (savedDate) {
        setLastUpdate(savedDate);
      } else {
        // Jika belum ada history, pakai tanggal hari ini
        setLastUpdate(formatDateTime(new Date()));
      }

      fetchHazardStatistics();
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
    
    // SIMULASI PROSES UPLOAD
    setTimeout(() => {
        setIsUploading(false);
        
        // --- LOGIKA UPDATE TANGGAL DISINI ---
        const now = new Date();
        const newTimeString = formatDateTime(now);
        
        // 1. Update Tampilan Layar
        setLastUpdate(newTimeString);
        
        // 2. Simpan ke Browser agar tidak hilang saat refresh
        localStorage.setItem('last_hazard_update', newTimeString);

        alert(`File ${selectedFile.name} berhasil diupload! Data diperbarui.`);
        
        setIsModalOpen(false); // Tutup modal
        setSelectedFile(null); // Reset file input
        
        // fetchHazardStatistics(); // Uncomment ini jika backend upload sudah siap untuk refresh data grafik
    }, 1500);
  };

  if (!isAuthorized) return <div className="h-screen bg-[#F8F9FA]"></div>;

  return (
    <Layout>
      <div className="w-full">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-black">Dashboard</h1>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-[#005DAA] hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-bold shadow-sm transition-all text-sm"
            >
                <UploadCloud size={18} />
                Import File
            </button>
        </div>

        {/* --- KOTAK HAZARD REPORT (HALF WIDTH FULL KIRI) --- */}
        <div className="w-full max-w-[1100px] bg-white rounded-[1.5rem] p-8 shadow-sm mb-12 border border-gray-100">
            <div className="flex justify-between items-start mb-8 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-[#005DAA] mb-2">Hazard Report</h2>
                    <span className="border border-gray-300 text-gray-500 text-xs px-3 py-1 rounded-full font-medium">
                        KAI DAOP 4
                    </span>
                    {/* BAGIAN TANGGAL UPDATE */}
                    <div className="mt-3">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Last Updated :</p>
                        <p className="text-sm font-bold text-gray-700">{lastUpdate}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-7xl font-black text-[#1F2937] tracking-tighter">
                        {summary.total}
                    </span>
                    <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">Total Hazard</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <BigGauge label="New Hazard" pct={summary.pctOpen} color={COLORS.new} />
                <BigGauge label="Open Hazard" pct={summary.pctOpen} color={COLORS.open} />
                <BigGauge label="In Progress" pct={summary.pctProgress} color={COLORS.progress} />
                <BigGauge label="Close Hazard" pct={summary.pctClosed} color={COLORS.closed} />
            </div>
        </div>

        {/* --- UNIT ANALYTICS --- */}
        <div className="w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-[#005DAA] pl-3">
                Detail Unit ({unitsData.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-12">
                {unitsData.map((unit, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-50 hover:shadow-lg transition-all duration-300">
                    <h4 className="text-sm font-bold text-gray-700 mb-4 h-6 truncate uppercase tracking-tight">
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
                    <div className="flex justify-between items-end px-1 gap-2">
                        <div className="flex gap-2 items-center">
                            <div className="w-1.5 h-8 bg-[#f59e0b] rounded-full"></div>
                            <div><span className="text-[10px] text-gray-400 block uppercase font-bold">Open</span><span className="text-lg font-bold text-gray-800 leading-none">{unit.chartData[0].value}</span></div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="w-1.5 h-8 bg-[#10b981] rounded-full"></div>
                            <div><span className="text-[10px] text-gray-400 block uppercase font-bold">Prog</span><span className="text-lg font-bold text-gray-800 leading-none">{unit.chartData[1].value}</span></div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="w-1.5 h-8 bg-[#8b5cf6] rounded-full"></div>
                            <div><span className="text-[10px] text-gray-400 block uppercase font-bold">Close</span><span className="text-lg font-bold text-gray-800 leading-none">{unit.chartData[2].value}</span></div>
                        </div>
                        <div className="flex gap-2 items-center border-l pl-4 border-gray-100">
                            <div className="w-1.5 h-8 bg-gray-400 rounded-full"></div>
                            <div><span className="text-[10px] text-gray-400 block uppercase font-bold">Total</span><span className="text-lg font-bold text-gray-800 leading-none">{unit.total}</span></div>
                        </div>
                    </div>
                </div>
                ))}
            </div>
        </div>
      </div>

      {/* --- POP-UP MODAL IMPORT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-[1.5rem] w-full max-w-md p-6 shadow-2xl transform scale-100 transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Import Data</h3>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="relative group mb-6">
                    <input 
                        type="file" 
                        accept=".xlsx, .xls, .csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center transition-all duration-300 ${selectedFile ? 'border-[#005DAA] bg-blue-50' : 'border-gray-300 bg-gray-50 group-hover:bg-gray-100'}`}>
                        {selectedFile ? (
                            <>
                                <FileSpreadsheet size={48} className="text-[#005DAA] mb-3 animate-bounce" />
                                <p className="text-sm font-bold text-[#005DAA] truncate max-w-[80%]">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                            </>
                        ) : (
                            <>
                                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                                    <UploadCloud size={32} className="text-[#005DAA]" />
                                </div>
                                <p className="text-sm font-bold text-gray-600">Pilih File Excel Anda</p>
                                <p className="text-xs text-gray-400 mt-1">Support: .xlsx, .csv</p>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                        className={`flex-1 py-3 rounded-xl font-bold text-white transition-all flex justify-center items-center gap-2 ${!selectedFile ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#005DAA] hover:bg-blue-800 shadow-lg hover:shadow-xl'}`}
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

// KOMPONEN GAUGE BESAR
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
                <div className="absolute bottom-0 mb-2 text-center">
                    <span className="text-xl font-bold text-gray-800">{pct}%</span>
                </div>
            </div>
        </div>
    );
}