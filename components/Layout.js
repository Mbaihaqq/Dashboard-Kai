import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Search, Menu, X, ChevronDown, LayoutDashboard, BarChart3, History, Users } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Layout({ children, onSearch }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [role, setRole] = useState('user');
  
  // State untuk Dropdown User (Desktop)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard');

  const router = useRouter();

  // Deteksi halaman History
  const isHistoryPage = router.pathname === '/History';

  useEffect(() => {
    setRole(sessionStorage.getItem('userRole') || 'user');
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    router.push('/loginPage/login');
  };

  const handlePageChange = (pageName, path) => {
    setCurrentPage(pageName);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false); // Tutup menu mobile saat pindah halaman
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col">
      
      {/* --- BARIS 1: TOP BAR (PUTIH) --- */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        {/* Kontainer Utama Top Bar */}
        <div className="px-4 md:px-8 py-3 flex justify-between items-center w-full">
          
          {/* 1. KIRI: Logo Area */}
          <div className="flex items-center gap-2 md:gap-4 cursor-pointer shrink-0" onClick={() => router.push('/')}>
            <img src="/logo-kai.png" alt="Logo KAI" className="h-8 md:h-10 w-auto object-contain" />
            <img src="/logo-daop4.png" alt="Logo Daop 4" className="h-10 md:h-12 w-auto object-contain" />
          </div>

          {/* 2. TENGAH: GROUP SEARCH + DROPDOWN (Hanya Desktop) */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-3 px-6">
            
            {/* SEARCH BAR (Desktop) */}
            {!isHistoryPage ? (
              <div className="relative w-full max-w-xl">
                 <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#F26522]">
                    <Search size={20} />
                 </div>
                 <input 
                    type="text" 
                    placeholder="Cari Uraian, Unit, Lokasi, atau No. Pelaporan..." 
                    onChange={(e) => onSearch && onSearch(e.target.value)}
                    className="w-full bg-[#F5F6F8] text-gray-600 rounded-lg py-3 pl-12 pr-4 outline-none focus:bg-white focus:ring-2 focus:ring-[#F26522]/20 transition-all text-sm"
                 />
              </div>
            ) : (
              <div className="flex-1"></div>
            )}

            {/* DROPDOWN USER (Desktop) */}
            {role === 'user' && (
              <div className="relative shrink-0">
                  <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-3 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 px-5 py-2.5 rounded-lg shadow-sm transition-all text-sm font-bold min-w-[180px] justify-between whitespace-nowrap"
                  >
                      <div className="flex items-center gap-2">
                          <LayoutDashboard size={18} className="text-[#005DAA]"/>
                          <span>{currentPage}</span>
                      </div>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Isi Dropdown (Desktop) */}
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
          </div>

          {/* 3. KANAN: Tombol Profil (Desktop) & Hamburger (Mobile) */}
          <div className="flex items-center gap-4 shrink-0">
             <div className="hidden md:block">
                <Link href="/profile">
                  <button className="bg-[#F26522] hover:bg-[#d95318] text-white px-8 py-2.5 rounded-lg font-bold shadow-md transition-all text-sm tracking-wide">
                    Profil
                  </button>
                </Link>
             </div>
             {/* Tombol Hamburger Mobile */}
             <div className="md:hidden">
               <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  className="text-[#005DAA] p-2 bg-blue-50 rounded-lg"
               >
                 {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
               </button>
             </div>
          </div>
        </div>

        {/* --- MOBILE MENU (SLIDE DOWN) --- */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-lg animate-in slide-in-from-top-2 flex flex-col max-h-[85vh] overflow-y-auto">
            <div className="px-4 py-6 space-y-6">
              
              {/* Search Bar (Mobile) */}
              {!isHistoryPage && (
                <div className="relative w-full">
                   <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#F26522]">
                      <Search size={20} />
                   </div>
                   <input 
                      type="text" 
                      placeholder="Cari Data Hazard..." 
                      onChange={(e) => onSearch && onSearch(e.target.value)}
                      className="w-full bg-[#F5F6F8] text-gray-600 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#F26522]/20 transition-all text-sm border border-gray-200"
                   />
                </div>
              )}

              {/* Menu User Khusus Mobile */}
              {role === 'user' && (
                <div className="flex flex-col space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Menu Pengguna</p>
                  <button onClick={() => handlePageChange('Dashboard', '/')} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-gray-700 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-[#005DAA]">
                      <LayoutDashboard size={18} /> Dashboard
                  </button>
                  <button onClick={() => handlePageChange('TL% Analytics', '/tl-analytics')} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-gray-700 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-[#005DAA]">
                      <BarChart3 size={18} /> TL% Analytics
                  </button>
                </div>
              )}

              {/* Menu Admin Khusus Mobile */}
              {role === 'admin' && (
                <div className="flex flex-col space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Menu Admin</p>
                  <button onClick={() => handlePageChange('Dashboard', '/')} className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold rounded-xl ${router.pathname === '/' ? 'bg-[#005DAA] text-white shadow-md' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'}`}>
                      <LayoutDashboard size={18} /> Dashboard
                  </button>
                  <button onClick={() => handlePageChange('TL% Analytics', '/tl-analytics')} className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold rounded-xl ${router.pathname === '/tl-analytics' ? 'bg-[#005DAA] text-white shadow-md' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'}`}>
                      <BarChart3 size={18} /> TL % Analytics
                  </button>
                  <button onClick={() => handlePageChange('History', '/History')} className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold rounded-xl ${router.pathname === '/History' ? 'bg-[#005DAA] text-white shadow-md' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'}`}>
                      <History size={18} /> Histori Penginputan Data
                  </button>
                  <button onClick={() => handlePageChange('Approval', '/admin/approval')} className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold rounded-xl ${router.pathname === '/admin/approval' ? 'bg-[#005DAA] text-white shadow-md' : 'text-gray-700 bg-gray-50 hover:bg-gray-100'}`}>
                      <Users size={18} /> Permohonan Akun
                  </button>
                </div>
              )}

              {/* Tombol Profil (Mobile) */}
              <div className="pt-4 border-t border-gray-100">
                 <Link href="/profile">
                   <button onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-[#F26522] hover:bg-[#d95318] text-white px-4 py-3.5 rounded-xl font-bold shadow-md transition-all text-sm tracking-wide flex justify-center">
                     Buka Profil
                   </button>
                 </Link>
              </div>

            </div>
          </div>
        )}
      </nav>

      {/* --- BARIS 2: NAVIGATION BAR (HANYA UNTUK ADMIN - TAMPILAN DESKTOP SAJA) --- */}
      {/* (Di Mobile, menu admin sudah dipindah ke dalam Hamburger Menu) */}
      {role === 'admin' && (
        <div className="bg-[#E85D18] shadow-md relative z-40 hidden md:block">
            <div className="w-full px-8 flex items-center gap-1 h-12">
                <Link href="/">
                    <div className={`px-6 py-1.5 rounded text-sm font-bold cursor-pointer transition-all flex items-center gap-2 ${router.pathname === '/' ? 'bg-[#1F2937] text-white shadow-lg' : 'text-white hover:bg-white/10'}`}>
                        <LayoutDashboard size={16} />
                        Dashboard
                    </div>
                </Link>
                <Link href="/tl-analytics"> 
                    <div className={`px-6 py-1.5 font-semibold text-sm rounded transition-all cursor-pointer flex items-center gap-2 ${router.pathname === '/tl-analytics' ? 'bg-[#1F2937] text-white' : 'text-white hover:bg-white/10'}`}>
                        <BarChart3 size={16} />
                        TL % Analytics
                    </div>
                </Link>
                <Link href="/History">
                    <div className={`px-6 py-1.5 font-semibold text-sm rounded transition-all cursor-pointer flex items-center gap-2 ${router.pathname === '/History' ? 'bg-[#1F2937] text-white shadow-lg' : 'text-white hover:bg-white/10'}`}>
                        <History size={16} />
                        Histori Penginputan Data
                    </div>
                </Link>
                <Link href="/admin/approval">
                    <div className={`px-6 py-1.5 font-semibold text-sm rounded transition-all cursor-pointer flex items-center gap-2 ${router.pathname === '/admin/approval' ? 'bg-[#1F2937] text-white' : 'text-white hover:bg-white/10'}`}>
                        <Users size={16} />
                        Permohonan Akun
                    </div>
                </Link>
            </div>
        </div>
      )}

      {/* --- MAIN CONTENT (FULL WIDTH) --- */}
      {/* Padding disesuaikan untuk layar HP (px-4) dan PC (px-8) */}
      <main className="w-full px-4 md:px-8 py-6 md:py-8 flex-grow">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#E85D18] h-1.5 w-full mt-auto"></footer>
    </div>
  );
}