import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [unitsData, setUnitsData] = useState([]);
  const [summary, setSummary] = useState({ new: 0, open: 0, progress: 0, closed: 0 });
  const [lastUpdate, setLastUpdate] = useState('');
  const [totalRows, setTotalRows] = useState(0);

  // SKEMA WARNA CHART (Colorful Style)
  const COLORS = {
    closed: '#22c55e',   // Hijau (Closed)
    progress: '#d946ef', // Pink/Ungu (In Progress - Sesuai style visual)
    open: '#ef4444'      // Merah (Open)
  };

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      router.push('/loginPage/login');
    } else {
      setIsAuthorized(true);
      fetchHazardStatistics();
      setLastUpdate(new Date().toLocaleDateString('id-ID', { 
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

      // 1. TARIK SEMUA DATA (LOOPING NO LIMIT)
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

      setTotalRows(allData.length);
      if (allData.length === 0) return;

      // 2. HITUNG SUMMARY (CARD WARNA-WARNI DI ATAS)
      const totalOpen = allData.filter(d => d.status === 'Open').length;
      const totalProgress = allData.filter(d => d.status === 'Work In Progress').length;
      const totalClosed = allData.filter(d => d.status === 'Closed').length;

      setSummary({
        new: totalOpen, // Asumsi New = Open
        open: totalOpen,
        progress: totalProgress,
        closed: totalClosed
      });

      // 3. LOGIKA UNIT DINAMIS (TAMPILKAN SEMUA UNIT DARI EXCEL)
      // Ambil nama unit unik, bersihkan spasi, filter yang kosong
      const allUniqueUnits = [...new Set(allData.map(item => item.unit?.trim()))].filter(Boolean);

      const formattedUnits = allUniqueUnits.map(unitName => {
        const unitItems = allData.filter(d => d.unit?.trim() === unitName);
        const total = unitItems.length;
        const closed = unitItems.filter(d => d.status === 'Closed').length;
        const progress = unitItems.filter(d => d.status === 'Work In Progress').length;
        const open = unitItems.filter(d => d.status === 'Open').length;
        
        // Rumus Persentase
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

      // Urutkan Unit A-Z
      setUnitsData(formattedUnits.sort((a, b) => a.name.localeCompare(b.name)));

    } catch (error) {
      console.error("Gagal memuat dashboard:", error.message);
    }
  };

  if (!isAuthorized) return <div className="h-screen bg-[#F8F9FA]"></div>;

  return (
    <Layout>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 pb-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Admin Dashboard
             </span>
           </div>
           <h1 className="text-3xl font-black text-[#005DAA] uppercase tracking-tighter">
             Hazard Report
           </h1>
           <p className="text-sm text-gray-400 font-bold tracking-wide">
             DAOP 4 SEMARANG MONITORING SYSTEM
           </p>
        </div>
        
        <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Last Update</p>
            <p className="text-sm font-bold text-[#005DAA]">{lastUpdate}</p>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold mt-1 inline-block">
               Total: {totalRows.toLocaleString()} Data
            </span>
        </div>
      </div>

      {/* SUMMARY CARDS (STYLE WARNA-WARNI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <SummaryCard 
          title="New Hazard" value={summary.new} 
          subtitle="Hazard Baru"
          bg="bg-pink-50" text="text-pink-600" 
        />
        <SummaryCard 
          title="Open Hazard" value={summary.open} 
          subtitle="Belum Ditindaklanjuti"
          bg="bg-orange-50" text="text-orange-600" 
        />
        <SummaryCard 
          title="In Progress" value={summary.progress} 
          subtitle="Sedang Proses"
          bg="bg-purple-50" text="text-purple-600" 
        />
        <SummaryCard 
          title="Closed Hazard" value={summary.closed} 
          subtitle="Selesai"
          bg="bg-green-50" text="text-green-600" 
        />
      </div>

      {/* GRID UNIT (DINAMIS 12+ CARD) */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-6 w-1 bg-[#005DAA] rounded-full"></div>
        <h3 className="text-xl font-black text-gray-800 uppercase italic">
           Unit Analytics
        </h3>
        <span className="bg-[#005DAA] text-white text-[10px] px-2 py-1 rounded-full font-bold">
            {unitsData.length} Units Found
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {unitsData.map((unit, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            
            {/* Header Card */}
            <div className="flex justify-between items-start mb-2 h-10">
                <h4 className="text-xs font-black text-[#005DAA] uppercase italic leading-tight w-3/4 line-clamp-2">
                    {unit.name}
                </h4>
                <div className="text-right">
                    <span className="text-xs font-black text-gray-700 block">{unit.total}</span>
                    <span className="text-[8px] text-gray-400 uppercase block">Total</span>
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative w-40 h-40 mx-auto my-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={unit.chartData}
                    innerRadius={50}
                    outerRadius={68}
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
              
              {/* Persentase di Tengah */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-gray-800 leading-none group-hover:scale-110 transition-transform">
                    {unit.completion}%
                </span>
                <span className="text-[9px] font-black text-gray-400 uppercase mt-1 tracking-widest">
                    TL%
                </span>
              </div>
            </div>

            {/* Legend Bawah */}
            <div className="grid grid-cols-3 gap-1 text-center border-t border-gray-50 pt-3 mt-2">
                <div className="flex flex-col items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mb-1"></span>
                    <span className="text-xs font-bold text-gray-600">{unit.chartData[2].value}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Open</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d946ef] mb-1"></span>
                    <span className="text-xs font-bold text-gray-600">{unit.chartData[1].value}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Prog</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mb-1"></span>
                    <span className="text-xs font-bold text-gray-600">{unit.chartData[0].value}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Close</span>
                </div>
            </div>

          </div>
        ))}
      </div>
    </Layout>
  );
}

// Komponen Kartu Summary
function SummaryCard({ title, value, subtitle, bg, text }) {
  return (
    <div className={`${bg} p-6 rounded-[2rem] shadow-sm flex flex-col justify-center min-h-[120px] hover:scale-105 transition-transform duration-200`}>
      <span className={`text-4xl font-black ${text} mb-1 block`}>
        {value.toLocaleString('id-ID')}
      </span>
      <span className={`text-xs font-black ${text} opacity-80 uppercase tracking-widest block mb-1`}>
        {title}
      </span>
      <span className={`text-[10px] ${text} opacity-60 font-medium`}>
        {subtitle}
      </span>
    </div>
  );
}