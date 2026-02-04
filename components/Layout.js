import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react'; // Pastikan install: npm install lucide-react
import { supabase } from '../lib/supabaseClient';

export default function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [role, setRole] = useState('user');
  const router = useRouter();

  useEffect(() => {
    setRole(sessionStorage.getItem('userRole') || 'user');
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    router.push('/loginPage/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col">
      
      {/* --- BAGIAN 1: TOP BAR (Logo, Search, Profil) --- */}
      <nav className="bg-white px-6 py-3 shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-[1400px] mx-auto w-full">
          
          {/* KIRI: Logo Area */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push('/')}>
            {/* Pastikan file logo ada di public folder */}
            <img src="/logo-kai.png" alt="Logo KAI" className="h-10 w-auto object-contain" />
            <img src="/logo-daop4.png" alt="Logo Daop 4" className="h-12 w-auto object-contain" />
          </div>

          {/* TENGAH: Search Bar (Hidden di Mobile, Visible di Desktop) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
             <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#F26522]">
                <Search size={20} />
             </div>
             <input 
                type="text" 
                placeholder="Search here..." 
                className="w-full bg-[#F5F6F8] text-gray-600 rounded-lg py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#F26522]/50 transition-all text-sm placeholder-gray-400"
             />
          </div>

          {/* KANAN: Tombol Profil / Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
             {/* Tombol Profil (Desktop) */}
             <div className="hidden md:block">
                <Link href="/profile">
                  <button className="bg-[#F26522] hover:bg-[#d95318] text-white px-8 py-2.5 rounded-lg font-bold shadow-md transition-all text-sm tracking-wide">
                    Profil
                  </button>
                </Link>
             </div>

             {/* Hamburger Menu (Mobile) */}
             <div className="md:hidden">
               <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#005DAA] p-2">
                 {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
               </button>
             </div>
          </div>
        </div>
      </nav>

      {/* --- BAGIAN 2: NAVIGATION BAR (Oranye) --- */}
      <div className="bg-[#E85D18] shadow-md relative z-40 hidden md:block">
         <div className="max-w-[1400px] mx-auto px-6 flex items-center gap-1 h-14">
            
            {/* Menu 1: Dashboard (Style Tombol Gelap Sesuai Gambar) */}
            <Link href="/">
               <div className={`px-6 py-2 rounded-lg font-bold text-sm cursor-pointer transition-all ${router.pathname === '/' ? 'bg-[#1F2937] text-white' : 'text-white hover:bg-white/10'}`}>
                  Dashboard
               </div>
            </Link>

            {/* Menu 2: TL % Analitics */}
            <Link href="#"> 
               <div className="px-6 py-2 text-white font-semibold text-sm hover:bg-white/10 rounded-lg transition-all cursor-pointer">
                  TL % Analitics
               </div>
            </Link>

            {/* Menu 3: Histori Penginputan Data (Map ke Import jika Admin) */}
            {role === 'admin' && (
                <Link href="/admin/import">
                   <div className={`px-6 py-2 font-semibold text-sm rounded-lg transition-all cursor-pointer ${router.pathname === '/admin/import' ? 'text-white bg-white/20' : 'text-white hover:bg-white/10'}`}>
                      Histori Penginputan Data
                   </div>
                </Link>
            )}

            {/* Menu 4: Permohonan Akun (Map ke Approval jika Admin) */}
            {role === 'admin' && (
                <Link href="/admin/approval">
                   <div className={`px-6 py-2 font-semibold text-sm rounded-lg transition-all cursor-pointer ${router.pathname === '/admin/approval' ? 'text-white bg-white/20' : 'text-white hover:bg-white/10'}`}>
                      Permohonan Akun
                   </div>
                </Link>
            )}

         </div>
      </div>

      {/* --- MOBILE MENU DROPDOWN --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute top-[70px] w-full left-0 z-50">
          <div className="px-6 py-4 space-y-3">
            {/* Search di Mobile */}
            <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input type="text" placeholder="Search..." className="w-full bg-gray-100 rounded-lg py-2.5 pl-10 text-sm outline-none" />
            </div>
            
            <Link href="/"><div className="block py-2 text-[#005DAA] font-bold border-b border-gray-100">Dashboard</div></Link>
            <Link href="#"><div className="block py-2 text-gray-600 font-medium border-b border-gray-100">TL % Analitics</div></Link>
            
            {role === 'admin' && (
              <>
                <Link href="/admin/import"><div className="block py-2 text-gray-600 font-medium border-b border-gray-100">Histori Penginputan Data</div></Link>
                <Link href="/admin/approval"><div className="block py-2 text-gray-600 font-medium border-b border-gray-100">Permohonan Akun</div></Link>
              </>
            )}
            
            <Link href="/profile"><div className="block py-2 text-[#F26522] font-bold">Profil Saya</div></Link>
            <button onClick={handleLogout} className="w-full mt-4 bg-red-600 text-white py-2 rounded-lg font-bold text-sm">Keluar</button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="w-full max-w-[1400px] mx-auto px-6 py-8 flex-grow">
        {children}
      </main>

      {/* FOOTER (Opsional / Sesuai Desain KAI) */}
      <footer className="bg-[#E85D18] h-2 w-full mt-auto"></footer>
    </div>
  );
}