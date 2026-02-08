import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Search, Menu, X, ChevronDown, LayoutDashboard, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [role, setRole] = useState('user');
  
  // State untuk Dropdown User
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard');

  const router = useRouter();

  useEffect(() => {
    setRole(sessionStorage.getItem('userRole') || 'user');
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    router.push('/loginPage/login');
  };

  // Fungsi ganti halaman untuk User
  const handlePageChange = (pageName, path) => {
    setCurrentPage(pageName);
    setIsDropdownOpen(false);
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col">
      
      {/* --- BARIS 1: TOP BAR (PUTIH) --- */}
      <nav className="bg-white px-8 py-3 shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="flex justify-between items-center w-full">
          
          {/* 1. KIRI: Logo Area */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push('/')}>
            <img src="/logo-kai.png" alt="Logo KAI" className="h-10 w-auto object-contain" />
            <img src="/logo-daop4.png" alt="Logo Daop 4" className="h-12 w-auto object-contain" />
          </div>

          {/* 2. TENGAH: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
             <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#F26522]">
                <Search size={20} />
             </div>
             <input 
                type="text" 
                placeholder="Search here..." 
                className="w-full bg-[#F5F6F8] text-gray-600 rounded-lg py-3 pl-12 pr-4 outline-none focus:bg-white focus:ring-2 focus:ring-[#F26522]/20 transition-all text-sm"
             />
          </div>

          {/* 3. TENGAH-KANAN: DROPDOWN MENU (HANYA UNTUK USER) */}
          {role === 'user' && (
            <div className="hidden md:block relative mr-6">
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 px-5 py-2.5 rounded-lg shadow-sm transition-all text-sm font-bold min-w-[180px] justify-between"
                >
                    <div className="flex items-center gap-2">
                        <LayoutDashboard size={18} className="text-[#005DAA]"/>
                        <span>{currentPage}</span>
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Isi Dropdown */}
                {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <div className="py-1">
                            <button 
                                onClick={() => handlePageChange('Dashboard', '/')}
                                className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-[#005DAA] flex items-center gap-3 border-b border-gray-50"
                            >
                                <LayoutDashboard size={16} />
                                Dashboard
                            </button>
                            <button 
                                onClick={() => handlePageChange('TL% Analytics', '/tl-analytics')} 
                                className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-[#005DAA] flex items-center gap-3"
                            >
                                <BarChart3 size={16} />
                                TL% Analytics
                            </button>
                        </div>
                    </div>
                )}
            </div>
          )}

          {/* 4. KANAN: Tombol Profil */}
          <div className="flex items-center gap-4">
             <div className="hidden md:block">
                <Link href="/profile">
                  <button className="bg-[#F26522] hover:bg-[#d95318] text-white px-8 py-2.5 rounded-lg font-bold shadow-md transition-all text-sm tracking-wide">
                    Profil
                  </button>
                </Link>
             </div>
             {/* Hamburger Mobile */}
             <div className="md:hidden">
               <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#005DAA] p-2">
                 {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
               </button>
             </div>
          </div>
        </div>
      </nav>

      {/* --- BARIS 2: NAVIGATION BAR (HANYA UNTUK ADMIN) --- */}
      {/* User TIDAK AKAN melihat bar oranye ini sama sekali */}
      {role === 'admin' && (
        <div className="bg-[#E85D18] shadow-md relative z-40 hidden md:block">
            <div className="w-full px-8 flex items-center gap-1 h-12">
                <Link href="/">
                    <div className={`px-6 py-1.5 rounded text-sm font-bold cursor-pointer transition-all ${router.pathname === '/' ? 'bg-[#1F2937] text-white shadow-lg' : 'text-white hover:bg-white/10'}`}>
                        Dashboard
                    </div>
                </Link>
                <Link href="#"> 
                    <div className="px-6 py-1.5 text-white font-semibold text-sm hover:bg-white/10 rounded transition-all cursor-pointer">
                        TL % Analitics
                    </div>
                </Link>
                <Link href="/admin/import">
                    <div className={`px-6 py-1.5 font-semibold text-sm rounded transition-all cursor-pointer ${router.pathname === '/admin/import' ? 'bg-[#1F2937] text-white' : 'text-white hover:bg-white/10'}`}>
                        Histori Penginputan Data
                    </div>
                </Link>
                <Link href="/admin/approval">
                    <div className={`px-6 py-1.5 font-semibold text-sm rounded transition-all cursor-pointer ${router.pathname === '/admin/approval' ? 'bg-[#1F2937] text-white' : 'text-white hover:bg-white/10'}`}>
                        Permohonan Akun
                    </div>
                </Link>
            </div>
        </div>
      )}

      {/* --- MAIN CONTENT (FULL WIDTH) --- */}
      <main className="w-full px-8 py-8 flex-grow">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#E85D18] h-1.5 w-full mt-auto"></footer>
    </div>
  );
}