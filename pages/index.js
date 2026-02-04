import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { Database, AlertCircle, Clock, CheckCircle, UploadCloud, Calendar } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [unitsData, setUnitsData] = useState([]);
  const [summary, setSummary] = useState({ 
    open: 0, pctOpen: 0,
    progress: 0, pctProgress: 0,
    closed: 0, pctClosed: 0,
    total: 0
  });
  const [lastUpdate, setLastUpdate] = useState('');

  // SKEMA WARNA CHART
  const COLORS = {
    closed: '#22c55e',   // Hijau
    progress: '#d946ef', // Pink/Ungu
    open: '#ef4444',     // Merah
    total: '#005DAA',    // Biru KAI
    empty: '#f3f4f6'     // Abu-abu background chart
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

  if (!isAuthorized) return <div className="h-screen bg-[#F8F9FA]"></div>;

  return (
    <Layout>
      {/* --- CONTAINER ATAS (SPLIT 2 KOLOM) --- */}
      <div className="flex flex-col xl:flex-row gap-6 mb-10 items-stretch">
        
        {/* KOLOM KIRI: JUDUL, INFO, & 4 KARTU GRAFIK (Expanded) */}
        <div className="flex-1 flex flex-col justify-between gap-6">
            
            {/* Header Text & Update Info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end px-2">
                <div>
                   <h1 className="text-3xl font-black text-[#005DAA] uppercase tracking-tighter leading-none">
                     Hazard Monitoring
                   </h1>
                   <p className="text-xs text-gray-500 font-bold tracking-wide mt-1">
                     DAOP 4 SEMARANG SYSTEM
                   </p>
                </div>
                <div className="flex items-center gap-2 mt-2 md:mt-0 text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
                    <Calendar size={14} className="text-[#005DAA]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Update: {lastUpdate}</span>
                </div>
            </div>

            {/* Grid 4 Kartu Ringkasan (Gauge Half Circle) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <GaugeCard 
                    title="Total Data" count={summary.total} percentage={100}
                    colorBg="bg-[#005DAA]" colorFill={COLORS.total} textColor="text-white"
                    icon={<Database size={16} className="text-white" />}
                    isDark={true} // Style khusus untuk Total
                />
                <GaugeCard 
                    title="Open Hazard" count={summary.open} percentage={summary.pctOpen}
                    colorBg="bg-red-50" colorFill={COLORS.open} textColor="text-red-600"
                    icon={<AlertCircle size={16} className="text-red-500" />}
                />
                <GaugeCard 
                    title="In Progress" count={summary.progress} percentage={summary.pctProgress}
                    colorBg="bg-purple-50" colorFill={COLORS.progress} textColor="text-purple-600"
                    icon={<Clock size={16} className="text-purple-500" />}
                />
                <GaugeCard 
                    title="Closed" count={summary.closed} percentage={summary.pctClosed}
                    colorBg="bg-green-50" colorFill={COLORS.closed} textColor="text-green-600"
                    icon={<CheckCircle size={16} className="text-green-500" />}
                />
            </div>
        </div>

        {/* KOLOM KANAN: TOMBOL IMPORT ONLY (Fixed Width) */}
        <div className="w-full xl:w-48 flex-shrink-0">
            <Link href="/admin/import">
                <button className="w-full h-full min-h-[180px] bg-white border-2 border-dashed border-[#005DAA]/30 hover:border-[#005DAA] hover:bg-blue-50/30 rounded-[2rem] flex flex-col items-center justify-center gap-4 group transition-all duration-300">
                    <div className="w-16 h-16 bg-[#005DAA] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <UploadCloud size={32} className="text-white" />
                    </div>
                    <div className="text-center">
                        <span className="block text-sm font-black text-[#005DAA] uppercase tracking-wider">Import File</span>
                        <span className="block text-[10px] font-bold text-gray-400 mt-1">Excel / CSV</span>
                    </div>
                </button>
            </Link>
        </div>

      </div>

      {/* --- BAGIAN BAWAH: UNIT ANALYTICS --- */}
      <div className="flex items-center justify-between mb-4 border-t border-gray-200 pt-8">
         <div className="flex items-center gap-3">
            <div className="h-6 w-1.5 bg-[#005DAA] rounded-full"></div>
            <h3 className="text-xl font-black text-gray-800 uppercase italic">Unit Analytics Detail</h3>
         </div>
         <span className="bg-gray-100 text-gray-600 text-[10px] px-3 py-1.5 rounded-full font-bold border border-gray-200">
            {unitsData.length} Units Found
         </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-12">
        {unitsData.map((unit, idx) => (
          <div key={idx} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
            
            {/* Header Unit */}
            <div className="mb-2 flex justify-between items-start h-8">
                <h4 className="text-xs font-black text-[#005DAA] uppercase leading-tight line-clamp-2 w-3/4 group-hover:text-[#F26522] transition-colors">
                    {unit.name}
                </h4>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                    {unit.total}
                </span>
            </div>

            {/* CHART SETENGAH LINGKARAN */}
            <div className="relative w-full h-28 flex justify-center items-end overflow-hidden mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={unit.chartData}
                    cx="50%" cy="100%"
                    startAngle={180} endAngle={0}
                    innerRadius={55} outerRadius={80}
                    paddingAngle={2} dataKey="value" stroke="none"
                  >
                    {unit.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute bottom-0 mb-1 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-gray-800 leading-none group-hover:scale-105 transition-transform">
                    {unit.completion}%
                </span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    TL%
                </span>
              </div>
            </div>

            {/* LEGEND GARIS VERTIKAL */}
            <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 pb-1">
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
          </div>
        ))}
      </div>
    </Layout>
  );
}

// KOMPONEN GAUGE CARD (Atas)
function GaugeCard({ title, count, percentage, colorBg, colorFill, textColor, icon, isDark }) {
  const chartData = [
    { value: percentage, color: colorFill }, 
    { value: 100 - percentage, color: isDark ? '#ffffff30' : '#e5e7eb' }
  ];

  return (
    <div className={`p-4 rounded-[1.8rem] shadow-sm border border-transparent hover:border-gray-200 transition-all relative overflow-hidden group ${colorBg}`}>
      
      {/* Header Kartu */}
      <div className="flex justify-between items-start mb-2 relative z-10">
         <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg shadow-sm ${isDark ? 'bg-white/20 text-white' : 'bg-white text-gray-600'}`}>
                {icon}
            </div>
            <h3 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-blue-100' : textColor} opacity-80`}>{title}</h3>
         </div>
         <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${isDark ? 'bg-white/20 text-white' : 'bg-white text-gray-600 border border-gray-100'}`}>
            {count.toLocaleString()}
         </span>
      </div>

      {/* Half Circle Gauge */}
      <div className="relative w-full h-20 flex justify-center items-end overflow-hidden z-10">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%" cy="100%"
              startAngle={180} endAngle={0}
              innerRadius={45} outerRadius={65}
              paddingAngle={0} dataKey="value" stroke="none"
            >
              <Cell fill={chartData[0].color} />
              <Cell fill={chartData[1].color} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Persentase */}
        <div className="absolute bottom-0 -mb-1 flex flex-col items-center justify-center pointer-events-none">
          <span className={`text-2xl font-black leading-none ${isDark ? 'text-white' : textColor}`}>
              {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}