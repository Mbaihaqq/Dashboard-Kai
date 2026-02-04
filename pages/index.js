import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react'; // Ikon agar lebih manis

export default function Dashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [unitsData, setUnitsData] = useState([]);
  const [summary, setSummary] = useState({ new: 0, open: 0, progress: 0, closed: 0 });
  const [lastUpdate, setLastUpdate] = useState('');
  const [totalRows, setTotalRows] = useState(0);

  // SKEMA WARNA CHART
  const COLORS = {
    closed: '#22c55e',   // Hijau
    progress: '#d946ef', // Pink/Ungu
    open: '#ef4444'      // Merah
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

      // 1. Fetch Data (No Limit)
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

      // 2. Summary Global
      const totalOpen = allData.filter(d => d.status === 'Open').length;
      const totalProgress = allData.filter(d => d.status === 'Work In Progress').length;
      const totalClosed = allData.filter(d => d.status === 'Closed').length;

      setSummary({
        new: totalOpen, 
        open: totalOpen,
        progress: totalProgress,
        closed: totalClosed
      });

      // 3. Grouping Unit
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

  if (!isAuthorized) return <div className="h-screen bg-[#F8F9FA]"></div>;

  return (
    <Layout>
      {/* --- HEADER DASHBOARD --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 pb-4 border-b border-gray-200">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className="bg-[#005DAA]/10 text-[#005DAA] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Admin View
             </span>
           </div>
           <h1 className="text-2xl font-black text-[#005DAA] uppercase tracking-tighter">
             Hazard Report
           </h1>
           <p className="text-xs text-gray-500 font-bold tracking-wide mt-0.5">
             DAOP 4 SEMARANG MONITORING SYSTEM
           </p>
        </div>
        
        <div className="text-right mt-4 md:mt-0">
            <div className="flex flex-col items-end">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Last Update</span>
                <span className="text-xs font-bold text-gray-700 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">
                    {lastUpdate}
                </span>
            </div>
        </div>
      </div>

      {/* --- SUMMARY CARDS (Bagian Atas yang Dipoles) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Total Data (Biru) */}
        <SummaryCard 
            title="Total Data" 
            value={totalRows} 
            subtitle="Semua Laporan" 
            bg="bg-blue-50" 
            text="text-blue-700" 
            icon={<TrendingUp size={16} />}
        />
        {/* Card 2: Open (Merah/Orange) */}
        <SummaryCard 
            title="Open Hazard" 
            value={summary.open} 
            subtitle="Belum Ditindaklanjuti" 
            bg="bg-orange-50" 
            text="text-orange-600" 
            icon={<AlertCircle size={16} />}
        />
        {/* Card 3: Progress (Ungu/Pink) */}
        <SummaryCard 
            title="In Progress" 
            value={summary.progress} 
            subtitle="Sedang Dikerjakan" 
            bg="bg-purple-50" 
            text="text-purple-600" 
            icon={<Clock size={16} />}
        />
        {/* Card 4: Closed (Hijau) */}
        <SummaryCard 
            title="Closed" 
            value={summary.closed} 
            subtitle="Selesai" 
            bg="bg-green-50" 
            text="text-green-600" 
            icon={<CheckCircle size={16} />}
        />
      </div>

      {/* --- UNIT ANALYTICS (Bagian Bawah - Half Circle & Clean Legend) --- */}
      <div className="flex items-center justify-between mb-4 mt-2">
         <div className="flex items-center gap-2">
            <div className="h-5 w-1 bg-[#005DAA] rounded-full"></div>
            <h3 className="text-lg font-black text-gray-800 uppercase italic">Unit Analytics</h3>
         </div>
         <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-full font-bold border border-gray-200">
            {unitsData.length} Units Found
         </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-12">
        {unitsData.map((unit, idx) => (
          <div key={idx} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
            
            {/* Header Unit */}
            <div className="mb-1 h-8 flex items-center">
                <h4 className="text-xs font-black text-[#005DAA] uppercase leading-tight line-clamp-2 group-hover:text-[#F26522] transition-colors">
                    {unit.name}
                </h4>
            </div>

            {/* CHART SETENGAH LINGKARAN */}
            <div className="relative w-full h-28 flex justify-center items-end overflow-hidden mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={unit.chartData}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {unit.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Persentase Tengah (Font Rapi) */}
              <div className="absolute bottom-0 mb-1 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-gray-800 leading-none group-hover:scale-105 transition-transform">
                    {unit.completion}%
                </span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    TL%
                </span>
              </div>
            </div>

            {/* LEGEND GARIS (Clean Style) */}
            <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 pb-2">
                {/* OPEN */}
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-5 bg-red-500 rounded-full"></div>
                    <div>
                        <span className="block text-sm font-bold text-gray-700 leading-none">{unit.chartData[0].value}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Open</span>
                    </div>
                </div>
                {/* PROGRESS */}
                <div className="flex items-center gap-1.5 justify-center border-l border-r border-gray-50 px-1">
                    <div className="w-1 h-5 bg-[#d946ef] rounded-full"></div>
                    <div>
                        <span className="block text-sm font-bold text-gray-700 leading-none">{unit.chartData[1].value}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Prog</span>
                    </div>
                </div>
                {/* CLOSED */}
                <div className="flex items-center gap-1.5 justify-end">
                    <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                    <div>
                        <span className="block text-sm font-bold text-gray-700 leading-none">{unit.chartData[2].value}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Close</span>
                    </div>
                </div>
            </div>

            {/* TOTAL DI BAWAH (Footer) */}
            <div className="mt-1 pt-2 border-t border-gray-50 text-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    Total Data: <span className="text-[#005DAA]">{unit.total}</span>
                </span>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

// Summary Card Baru (Compact & Rapi)
function SummaryCard({ title, value, subtitle, bg, text, icon }) {
  return (
    <div className={`${bg} p-4 rounded-[1.2rem] shadow-sm flex flex-col justify-center min-h-[90px] border border-transparent hover:border-gray-100 transition-all`}>
      <div className="flex justify-between items-start mb-1">
         <span className={`text-[10px] font-black uppercase tracking-widest opacity-80 ${text}`}>
            {title}
         </span>
         <div className={`p-1 rounded-full bg-white/40 ${text}`}>
            {icon}
         </div>
      </div>
      <span className={`text-3xl font-black ${text} leading-tight`}>
        {value.toLocaleString('id-ID')}
      </span>
      <span className={`text-[9px] ${text} opacity-60 font-medium mt-1`}>
        {subtitle}
      </span>
    </div>
  );
}