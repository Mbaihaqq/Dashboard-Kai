import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { 
  Settings, TrainFront, RadioTower, 
  Building2, Wrench, Users, Search, BarChart3, 
  ArrowUpDown, Filter 
} from 'lucide-react';

export default function TLAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdate, setLastUpdate] = useState('-');
  const [totalRowsLoaded, setTotalRowsLoaded] = useState(0);
  
  // STATE BARU: Untuk Mengatur Arah Sortir (desc = Tinggi ke Rendah, asc = Rendah ke Tinggi)
  const [sortOrder, setSortOrder] = useState('desc'); 

  useEffect(() => {
    const checkSession = async () => {
        const loggedIn = sessionStorage.getItem('isLoggedIn');
        if (!loggedIn) {
            router.push('/loginPage/login');
            return;
        }
        
        const savedDate = localStorage.getItem('last_update_fixed');
        if (savedDate) setLastUpdate(savedDate);

        fetchAnalytics();
    };
    checkSession();
  }, []);

  const fetchAnalytics = async () => {
    try {
        setLoading(true);
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

            if (data.length > 0) {
                allData = [...allData, ...data];
                from += 1000;
                to += 1000;
            } else {
                hasMore = false;
            }
        }

        setTotalRowsLoaded(allData.length);
        processData(allData);

    } catch (error) {
        console.error("Gagal load analytics:", error.message);
    } finally {
        setLoading(false);
    }
  };

  const processData = (data) => {
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

    const result = Object.keys(grouped).map(name => {
        const { total, closed } = grouped[name];
        
        // --- PERBAIKAN MATEMATIKA ---
        // Rumus: (closed / total) * 100
        // Math.min(100, ...) memastikan tidak akan lebih dari 100% walaupun data aneh (closed > total)
        let rawPercentage = total === 0 ? 0 : Math.round((closed / total) * 100);
        const percentage = Math.min(100, rawPercentage);
        
        return { name, percentage, total, closed };
    });

    setAnalyticsData(result);
  };

  // --- LOGIKA FILTER & SORTING ---
  const getProcessedData = () => {
    // 1. Filter dulu berdasarkan Search
    let filtered = analyticsData.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Lalu Sortir berdasarkan tombol yang dipilih user
    return filtered.sort((a, b) => {
        if (sortOrder === 'desc') {
            return b.percentage - a.percentage; // Tertinggi ke Terendah
        } else {
            return a.percentage - b.percentage; // Terendah ke Tertinggi
        }
    });
  };

  const finalData = getProcessedData();

  // --- LOGIKA WARNA (Sesuai Request) ---
  // > 80% = Hijau
  // 50% - 80% = Kuning
  // < 50% = Merah
  const getColor = (pct) => {
    if (pct > 80) return { bar: 'bg-[#22C55E]', bg: 'bg-[#DCFCE7]', text: 'text-[#15803d]' };
    if (pct >= 50) return { bar: 'bg-[#EAB308]', bg: 'bg-[#FEF9C3]', text: 'text-[#a16207]' }; 
    return { bar: 'bg-[#EF4444]', bg: 'bg-[#FEE2E2]', text: 'text-[#b91c1c]' }; 
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

        {/* PROGRESS LIST CARD */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-8 min-h-[500px]">
            
            {/* CARD HEADER & SORT BUTTON */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-100 pb-4 gap-4">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 size={18} />
                    Progress Penyelesaian per Unit
                </h2>
                
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <span className="text-xs text-gray-400 font-medium">
                        Menampilkan {finalData.length} Unit
                    </span>
                    
                    {/* TOMBOL SORTIR BARU */}
                    <button 
                        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 transition-all active:scale-95"
                    >
                        <ArrowUpDown size={14} />
                        Urutkan: {sortOrder === 'desc' ? 'Tertinggi ke Terendah' : 'Terendah ke Tertinggi'}
                    </button>
                </div>
            </div>

            {/* LIST CONTENT */}
            {loading ? (
                 <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005DAA] mb-2"></div>
                    Memuat {totalRowsLoaded > 0 ? totalRowsLoaded : ''} data...
                </div>
            ) : finalData.length > 0 ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {finalData.map((item, idx) => {
                        const colorStyle = getColor(item.percentage);
                        return (
                            <div key={idx} className="group">
                                {/* Header Item */}
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${colorStyle.bg} ${colorStyle.text} transition-colors duration-300`}>
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
                                        <span className={`text-2xl font-black ${colorStyle.text} transition-colors duration-300`}>
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