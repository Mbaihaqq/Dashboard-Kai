import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'; // Import Link untuk tombol
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';
// Import Ikon
import { Database, AlertCircle, Clock, CheckCircle, UploadCloud } from 'lucide-react';

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

      const grandTotal = allData.length;
      if (grandTotal === 0) return;

      // 2. Summary & Persentase
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

      // 3. Unit Data
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-gray-200 pb-5">
        
        {/* Kiri: Judul */}
        <div>
           <h1 className="text-3xl font-black text-[#005DAA] uppercase tracking-tighter leading-none">
             Hazard Monitoring
           </h1>
           <p className="text-xs text-gray-500 font-bold tracking-wide mt-1">
             DAOP 4 SEMARANG SYSTEM
           </p>
        </div>
        
        {/* Kanan: Tombol Import & Info Update */}
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
            <div className="text-right">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Last Update</span>
                <span className="text-xs font-bold text-gray-700 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm block mt-0.5">
                    {lastUpdate}
                </span>
            </div>

            {/* TOMBOL IMPORT DATA (BARU) */}
            <Link href="/admin/import">
                <button className="flex items-center gap-2 bg-[#22c55e] hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                    <UploadCloud size={18} />
                    <span className="text-sm">Import Data</span>
                </button>
            </Link>
        </div>
      </div>

      {/* --- BAGIAN ATAS: GAUGE CARDS (HALF CIRCLE) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <GaugeCard 
            title="Total Data" count={summary.total} percentage={100}
            colorBg="bg-[#005DAA]" colorFill={COLORS.total}
            icon={<Database size={16} className="text-white" />}
        />
        <GaugeCard 
            title="Open Hazard" count={summary.open} percentage={summary.pctOpen}
            colorBg="bg-red-500" colorFill={COLORS.open}
            icon={<AlertCircle size={16} className="text-white" />}
        />
        <GaugeCard 
            title="In Progress" count={summary.progress} percentage={summary.pctProgress}
            colorBg="bg-[#d946ef]" colorFill={COLORS.progress}
            icon={<Clock size={16} className="text-white" />}
        />
        <GaugeCard 
            title="Closed" count={summary.closed} percentage={summary.pctClosed}
            colorBg="bg-green-500" colorFill={COLORS.closed}
            icon={<CheckCircle size={16} className="text-white" />}
        />
      </div>

      {/* --- BAGIAN BAWAH: UNIT ANALYTICS --- */}
      <div className="flex items-center justify-between mb-4 border-t border-gray-200 pt-6">
         <div className="flex items-center gap-2">
            <div className="h-5 w-1.5 bg-[#005DAA] rounded-full"></div>
            <h3 className="text-lg font-black text-gray-800 uppercase italic">Unit Analytics Detail</h3>
         </div>
         <span className="bg-gray-100 text-gray-600 text-[10px] px-3 py-1 rounded-full font-bold border border-gray-200">
            {unitsData.length} Units Found
         </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-12">
        {unitsData.map((unit, idx) => (
          <div key={idx} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
            
            {/* Header Unit */}
            <div className="mb-1 h-8 flex justify-between items-center">
                <h4 className="text-xs font-black text-[#005DAA] uppercase leading-tight line-clamp-2 w-3/4 group-hover:text-[#F26522] transition-colors">
                    {unit.name}
                </h4>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">{unit.total}</span>
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

// Komponen GAUGE CARD (Atas)
function GaugeCard({ title, count, percentage, colorBg, colorFill, icon }) {
  const chartData = [
    { value: percentage, color: colorFill }, 
    { value: 100 - percentage, color: '#f3f4f6' }
  ];

  return (
    <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
      <div className={`absolute top-0 left-0 w-full h-1 ${colorBg}`}></div>
      
      <div className="flex justify-between items-start mb-3">
         <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${colorBg} shadow-sm`}>
                {icon}
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-600">{title}</h3>
         </div>
         <span className="text-xs font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
            {count.toLocaleString()}
         </span>
      </div>

      <div className="relative w-full h-20 flex justify-center items-end overflow-hidden">
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
        
        <div className="absolute bottom-0 -mb-1 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black leading-none" style={{color: colorFill}}>
              {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}