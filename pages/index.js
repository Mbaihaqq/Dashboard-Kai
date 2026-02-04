import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [unitsData, setUnitsData] = useState([]);
  const [summary, setSummary] = useState({ open: 0, progress: 0, closed: 0, total: 0 });
  const [lastUpdate, setLastUpdate] = useState('');

  // Skema Warna Status (Sesuai Standar Monitoring)
  const COLORS = {
    closed: '#22c55e',   // Hijau (Selesai)
    progress: '#F26522', // Oranye (Proses - Khas KAI)
    open: '#ef4444'      // Merah (Belum Selesai)
  };

  useEffect(() => {
    // Cek status login & role
    const loggedIn = sessionStorage.getItem('isLoggedIn');
    const role = sessionStorage.getItem('userRole');

    if (!loggedIn) {
      router.push('/loginPage/login');
    } else {
      setIsAuthorized(true);
      fetchHazardStatistics();
      
      // Set tanggal update hari ini
      const now = new Date();
      setLastUpdate(now.toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      }));
    }
  }, [router]);

  const fetchHazardStatistics = async () => {
    try {
      let allData = [];
      let from = 0;
      let to = 999;
      let hasMore = true;

      // --- 1. AMBIL DATA TANPA BATAS (NO LIMIT) ---
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

      if (allData.length === 0) return;

      // --- 2. HITUNG RINGKASAN TOTAL (HEADER) ---
      const totalOpen = allData.filter(d => d.status === 'Open').length;
      const totalProgress = allData.filter(d => d.status === 'Work In Progress').length;
      const totalClosed = allData.filter(d => d.status === 'Closed').length;

      setSummary({
        open: totalOpen,
        progress: totalProgress,
        closed: totalClosed,
        total: allData.length
      });

      // --- 3. HITUNG PER UNIT (DINAMIS MENGIKUTI EXCEL) ---
      // Ambil semua nama unit unik dari data, hapus spasi berlebih
      const allUniqueUnits = [...new Set(allData.map(item => item.unit?.trim()))].filter(Boolean);

      const formattedUnits = allUniqueUnits.map(unitName => {
        const unitItems = allData.filter(d => d.unit?.trim() === unitName);
        const total = unitItems.length;
        const closed = unitItems.filter(d => d.status === 'Closed').length;
        const progress = unitItems.filter(d => d.status === 'Work In Progress').length;
        const open = unitItems.filter(d => d.status === 'Open').length;
        
        // Hitung TL% (Persentase Penyelesaian)
        const completion = total > 0 ? Math.round((closed / total) * 100) : 0;

        return {
          name: unitName,
          total,
          completion,
          chartData: [
            { name: 'Closed', value: closed, color: COLORS.closed },
            { name: 'Progress', value: progress, color: COLORS.progress },
            { name: 'Open', value: open, color: COLORS.open }
          ]
        };
      });

      // Urutkan nama unit dari A-Z agar rapi
      setUnitsData(formattedUnits.sort((a, b) => a.name.localeCompare(b.name)));

    } catch (error) {
      console.error("Gagal memuat dashboard:", error.message);
    }
  };

  if (!isAuthorized) return <div className="h-screen bg-[#F3F4F6]"></div>;

  return (
    <Layout>
      {/* --- HEADER DASHBOARD --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-300 pb-4">
        <div>
          <h1 className="text-3xl font-black text-[#005DAA] uppercase tracking-tighter">
            Hazard Report
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-1 tracking-wide">
            DAOP 4 SEMARANG MONITORING SYSTEM
          </p>
        </div>
        <div className="text-right mt-4 md:mt-0">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Update</p>
          <p className="text-sm font-bold text-[#005DAA]">{lastUpdate}</p>
        </div>
      </div>

      {/* --- SUMMARY CARDS (ATAS) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <SummaryCard 
          title="Total Temuan" 
          value={summary.total} 
          bg="bg-[#005DAA]" 
          text="text-white"
        />
        <SummaryCard 
          title="Open Hazard" 
          value={summary.open} 
          bg="bg-red-50" 
          text="text-red-600" 
          border="border-red-100"
        />
        <SummaryCard 
          title="In Progress" 
          value={summary.progress} 
          bg="bg-orange-50" 
          text="text-[#F26522]" 
          border="border-orange-100"
        />
        <SummaryCard 
          title="Closed Hazard" 
          value={summary.closed} 
          bg="bg-green-50" 
          text="text-green-600" 
          border="border-green-100"
        />
      </div>

      {/* --- JUDUL UNIT SECTION --- */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-6 w-1 bg-[#F26522]"></div>
        <h3 className="text-lg font-black text-gray-800 uppercase italic">
          Unit Analytics
        </h3>
        <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-1 rounded font-bold ml-2">
           {unitsData.length} Units
        </span>
      </div>

      {/* --- GRID UNIT (CARD) --- */}
      {/* Grid akan otomatis menyesuaikan jumlah unit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {unitsData.map((unit, idx) => (
          <div 
            key={idx} 
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 relative group"
          >
            {/* Nama Unit & Total */}
            <div className="flex justify-between items-start mb-2 h-10">
                <h4 className="text-xs font-black text-[#005DAA] uppercase leading-tight w-3/4 line-clamp-2 group-hover:text-[#F26522] transition-colors">
                    {unit.name}
                </h4>
                <div className="text-right">
                    <span className="text-xs font-bold text-gray-700 block">{unit.total}</span>
                    <span className="text-[8px] text-gray-400 uppercase block">Total</span>
                </div>
            </div>

            {/* Grafik Donut */}
            <div className="relative w-36 h-36 mx-auto my-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={unit.chartData}
                    innerRadius={48}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {unit.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Persentase TL% di Tengah */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className={`text-3xl font-black ${unit.completion === 100 ? 'text-green-600' : 'text-gray-800'}`}>
                    {unit.completion}%
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    TL%
                </span>
              </div>
            </div>

            {/* Legend / Detail Status */}
            <div className="grid grid-cols-3 gap-1 text-center border-t border-gray-100 pt-3 mt-2">
                <div>
                    <span className="block text-xs font-bold text-red-500">{unit.chartData[2].value}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Open</span>
                </div>
                <div>
                    <span className="block text-xs font-bold text-[#F26522]">{unit.chartData[1].value}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Prog</span>
                </div>
                <div>
                    <span className="block text-xs font-bold text-green-500">{unit.chartData[0].value}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Close</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

// Komponen Kartu Ringkasan
function SummaryCard({ title, value, bg, text, border = "border-transparent" }) {
  return (
    <div className={`${bg} border ${border} p-5 rounded-2xl shadow-sm flex flex-col justify-center min-h-[110px]`}>
      <span className={`text-4xl font-black ${text} mb-1`}>
        {value.toLocaleString('id-ID')}
      </span>
      <span className={`text-[10px] font-black uppercase tracking-widest opacity-80 ${text === 'text-white' ? 'text-blue-100' : 'text-gray-500'}`}>
        {title}
      </span>
    </div>
  );
}