import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { UploadCloud } from 'lucide-react';

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

  // SKEMA WARNA (SESUAI GAMBAR DESIGN A)
  // New = Merah/Pink, Open = Kuning, Progress = Hijau, Close = Ungu
  const COLORS = {
    new: '#ef4444',      // Merah
    open: '#f59e0b',     // Kuning/Orange
    progress: '#10b981', // Hijau (Teal)
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

      // Asumsi: New Hazard diambil dari Open (karena di excel biasanya blm ada status 'New')
      // Atau kalau ada status 'New', ganti filter di bawah.
      const tOpen = allData.filter(d => d.status === 'Open').length;
      const tProg = allData.filter(d => d.status === 'Work In Progress').length;
      const tClosed = allData.filter(d => d.status === 'Closed').length;
      
      // Hitung persentase
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
      {/* --- HEADER PAGE (JUDUL & TOMBOL IMPORT TERPISAH) --- */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        
        {/* Tombol Import Kecil di Pojok Kanan Atas */}
        <Link href="/admin/import">
          <button className="flex items-center gap-2 bg-[#005DAA] hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-all text-sm">
            <UploadCloud size={16} />
            Import File
          </button>
        </Link>
      </div>

      {/* --- SATU KOTAK PUTIH BESAR (CONTAINER UTAMA) --- */}
      {/* Ini yang bikin sama persis kayak Design A */}
      <div className="bg-white rounded-[1.5rem] p-8 shadow-sm mb-10 border border-gray-100">
        
        {/* Header Dalam Kotak */}
        <div className="flex justify-between items-start mb-8">
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

        {/* Row 4 Grafik Setengah Lingkaran */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <BigGauge label="New Hazard" pct={summary.pctOpen} color={COLORS.new} />
            <BigGauge label="Open Hazard" pct={summary.pctOpen} color={COLORS.open} />
            <BigGauge label="In Progress" pct={summary.pctProgress} color={COLORS.progress} />
            <BigGauge label="Close Hazard" pct={summary.pctClosed} color={COLORS.closed} />
        </div>
      </div>

      {/* --- BAGIAN BAWAH: UNIT ANALYTICS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {unitsData.map((unit, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-50 hover:shadow-lg transition-all duration-300">
            
            {/* Judul Unit */}
            <h4 className="text-sm font-medium text-gray-600 mb-4">
                {unit.name}
            </h4>

            {/* Chart Unit */}
            <div className="relative w-full h-32 flex justify-center items-end overflow-hidden mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={unit.chartData}
                    cx="50%" cy="100%"
                    startAngle={180} endAngle={0}
                    innerRadius={60} outerRadius={85}
                    paddingAngle={2} dataKey="value" stroke="none"
                  >
                    {unit.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Persentase TL% */}
              <div className="absolute bottom-0 mb-1 flex flex-col items-center">
                <span className="text-2xl font-black text-[#005DAA] leading-none">
                    {unit.completion}%
                </span>
                <span className="text-[10px] text-gray-400 font-bold mt-1">TL%</span>
              </div>
            </div>

            {/* Legend Unit (Garis Warna) */}
            <div className="flex justify-between items-end px-2">
                 {/* Open */}
                 <div className="flex gap-2 items-center">
                    <div className="w-1 h-8 bg-[#f59e0b] rounded-full"></div>
                    <div>
                        <span className="text-[10px] text-gray-400 block">Open</span>
                        <span className="text-lg font-bold text-gray-800 leading-none">{unit.chartData[0].value.toLocaleString()}</span>
                    </div>
                 </div>
                 
                 {/* Progress */}
                 <div className="flex gap-2 items-center">
                    <div className="w-1 h-8 bg-[#10b981] rounded-full"></div>
                    <div>
                        <span className="text-[10px] text-gray-400 block">In Progress</span>
                        <span className="text-lg font-bold text-gray-800 leading-none">{unit.chartData[1].value.toLocaleString()}</span>
                    </div>
                 </div>

                 {/* Close */}
                 <div className="flex gap-2 items-center">
                    <div className="w-1 h-8 bg-[#8b5cf6] rounded-full"></div>
                    <div>
                        <span className="text-[10px] text-gray-400 block">Close</span>
                        <span className="text-lg font-bold text-gray-800 leading-none">{unit.chartData[2].value.toLocaleString()}</span>
                    </div>
                 </div>
                 
                 {/* Total */}
                 <div className="flex gap-2 items-center border-l pl-2 border-gray-200">
                    <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
                    <div>
                        <span className="text-[10px] text-gray-400 block">Total</span>
                        <span className="text-lg font-bold text-gray-800 leading-none">{unit.total.toLocaleString()}</span>
                    </div>
                 </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

// KOMPONEN CHART GAUGE BESAR (UNTUK KOTAK UTAMA)
function BigGauge({ label, pct, color }) {
    const data = [
        { value: pct, color: color },
        { value: 100 - pct, color: '#e5e7eb' } // Gray background part
    ];

    return (
        <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{label}</h3>
            <div className="relative w-40 h-24 flex justify-center items-end overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%" cy="100%"
                            startAngle={180} endAngle={0}
                            innerRadius={55} outerRadius={75}
                            paddingAngle={0} dataKey="value" stroke="none"
                        >
                            <Cell fill={data[0].color} />
                            <Cell fill={data[1].color} />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/* Persentase di Tengah */}
                <div className="absolute bottom-0 mb-1 text-center">
                    <span className="text-xl font-bold text-gray-800">{pct}%</span>
                </div>
            </div>
        </div>
    );
}