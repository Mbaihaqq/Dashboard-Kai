import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { 
  Settings, TrainFront, RadioTower, 
  Building2, Wrench, Users, Search, BarChart3 
} from 'lucide-react';

export default function TLAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdate, setLastUpdate] = useState('-');
  const [totalRowsLoaded, setTotalRowsLoaded] = useState(0); // Indikator jumlah data

  useEffect(() => {
    const checkSession = async () => {
        const loggedIn = sessionStorage.getItem('isLoggedIn');
        if (!loggedIn) {
            router.push('/loginPage/login');
            return;
        }
        
        // Ambil Last Update
        const savedDate = localStorage.getItem('last_update_fixed');
        if (savedDate) setLastUpdate(savedDate);

        fetchAnalytics();
    };
    checkSession();
  }, []);

  // --- 1. FETCH SEMUA DATA (LOOPING SAMPAI HABIS) ---
  const fetchAnalytics = async () => {
    try {
        setLoading(true);
        let allData = [];
        let from = 0;
        let to = 999;
        let hasMore = true;

        // Loop request per 1000 data sampai tidak ada sisa
        while (hasMore) {
            const { data, error } = await supabase
                .from('hazards')
                .select('unit, status')
                .range(from, to);

            if (error) throw error;

            if (data.length > 0) {
                allData = [...allData, ...data];
                from += 1000;
                to += 1000;
            } else {
                hasMore = false; // Berhenti kalau data habis
            }
        }

        setTotalRowsLoaded(allData.length); // Harusnya 7713 sesuai excel
        processData(allData);

    } catch (error) {
        console.error("Gagal load analytics:", error.message);
    } finally {
        setLoading(false);
    }
  };

  const processData = (data) => {
    // 2. Kelompokkan data per Unit
    const grouped = {};
    
    data.forEach(item => {
        let unitName = item.unit ? item.unit.trim() : 'Unknown';
        
        if (!grouped[unitName]) {
            grouped[unitName] = { total: 0, closed: 0 };
        }
        
        grouped[unitName].total += 1;
        if (item.status === 'Closed') {
            grouped[unitName].closed += 1;
        }
    });

    // 3. Hitung Persentase
    const result = Object.keys(grouped).map(name => {
        const { total, closed } = grouped[name];
        const percentage = total === 0 ? 0 : Math.round((closed / total) * 100);
        
        return { name, percentage, total, closed };
    });

    // 4. SORTING: Dari yang completion Paling BESAR ke KECIL
    const sortedResult = result.sort((a, b) => b.percentage - a.percentage);

    setAnalyticsData(sortedResult);
  };

  // --- FILTER SEARCH ---
  const filteredData = analyticsData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- 5. LOGIKA WARNA BARU ---
  // > 80% = Hijau
  // 50% - 80% = Kuning
  // < 50% = Merah
  const getColor = (pct) => {
    if (pct > 80) return { bar: 'bg-[#22C55E]', bg: 'bg-[#DCFCE7]', text: 'text-[#15803d]' }; // Hijau
    if (pct >= 50) return { bar: 'bg-[#EAB308]', bg: 'bg-[#FEF9C3]', text: 'text-[#a16207]' }; // Kuning
    return { bar: 'bg-[#EF4444]', bg: 'bg-[#FEE2E2]', text: 'text-[#b91c1c]' }; // Merah
  };

  const getIcon = (unitName) => {
    const lower = unitName.toLowerCase();
    if (lower.includes('operasi')) return <Settings size={24} />;
    if (lower.includes('jalan') || lower.includes('jembatan')) return <TrainFront size={24} />;
    if (lower.includes('sinyal') || lower.includes('telekomunikasi')) return <RadioTower size={24} />;
    if (lower.includes('bangunan')) return <Building2 size={24} />;
    if (lower.includes('sarana')) return <Wrench size={24} />;
    if (lower.includes('penumpang')) return <Users size={24} />;
    return <BarChart3 size={24} />;
  };

  return (
    <Layout onSearch={setSearchTerm}>
      <div className="w-full px-6 py-4">
        
        {/* HEADER */}
        <div className="mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-black mb-2">TL % Analytics</h1>
                <div className="flex items-center gap-3 mb-2">
                    <span className="border border-gray-400 text-gray-600 text-xs font-bold px-3 py-1 rounded-full bg-white">
                        KAI DAOP 4
                    </span>
                    {!loading && (
                        <span className="bg-blue-100 text-[#005DAA] text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                            Total Data: {totalRowsLoaded.toLocaleString()} Baris
                        </span>
                    )}
                </div>
                <p className="text-xs text-gray-500 font-medium">
                    Last Updated : {lastUpdate}
                </p>
            </div>
        </div>

        {/* PROGRESS LIST */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-8 min-h-[500px]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Progress Penyelesaian per Unit (Sorted Highest %)
                </h2>
                <span className="text-xs text-gray-400 font-medium">
                    Menampilkan {filteredData.length} Unit
                </span>
            </div>

            {loading ? (
                 <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005DAA] mb-2"></div>
                    Memuat {totalRowsLoaded > 0 ? totalRowsLoaded : ''} data...
                </div>
            ) : filteredData.length > 0 ? (
                <div className="space-y-8">
                    {filteredData.map((item, idx) => {
                        const colorStyle = getColor(item.percentage);
                        return (
                            <div key={idx} className="group">
                                {/* Header Item */}
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${colorStyle.bg} ${colorStyle.text}`}>
                                            {getIcon(item.name)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#005DAA] transition-colors">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs text-gray-400 font-medium">
                                                {item.closed} Closed / {item.total} Total
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-2xl font-black ${colorStyle.text}`}>
                                            {item.percentage}%
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar Container */}
                                <div className={`w-full h-3 ${colorStyle.bg} rounded-full overflow-hidden relative`}>
                                    <div 
                                        className={`h-full ${colorStyle.bar} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Search size={40} className="mb-2 opacity-20"/>
                    <p>Unit "{searchTerm}" tidak ditemukan.</p>
                </div>
            )}
        </div>

      </div>
    </Layout>
  );
}