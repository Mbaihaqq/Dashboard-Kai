import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Menu, X } from 'lucide-react'; 

export default function Layout({ children }) { 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const isProfilePage = router.pathname.includes('/profile');

  // Fungsi baru untuk menangani logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn'); // Hapus status login
    router.push('/loginPage/login');
  };

  const getNavClass = (path) => {
    const isActive = router.pathname === path;
    const baseClass = "px-6 py-2 rounded-lg font-semibold transition-all duration-200 border border-[#F26522] text-sm";
    
    if (isActive) {
      return `${baseClass} bg-[#F26522] text-white shadow-md`;
    } else {
      return `${baseClass} bg-white text-[#F26522] hover:bg-orange-50`;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col justify-between">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="w-full px-6 sm:px-10 lg:px-12"> 
          <div className="flex justify-between h-24 items-center">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push('/')}>
              <img src="/logo-kai.png" alt="Logo KAI" className="h-12 w-auto object-contain" />
              <img src="/logo-daop4.png" alt="Logo Daop 4" className="h-14 w-auto object-contain" />
            </div>

            <div className="hidden md:flex space-x-6 items-center">
              <Link href="/">
                <button className={getNavClass('/')}>Dashboard</button>
              </Link>
              <Link href="/target">
                <button className={getNavClass('/target')}>Target Pendapatan</button>
              </Link>
              <Link href="/tickets">
                <button className={getNavClass('/tickets')}>Permasalahan Tiket</button>
              </Link>
            </div>

            <div className="hidden md:flex items-center">
               {isProfilePage ? (
                  // Ganti button Keluar untuk menjalankan handleLogout
                  <button 
                    onClick={handleLogout}
                    className="bg-[#005DAA] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition shadow-md text-sm"
                  >
                    Keluar
                  </button>
               ) : (
                  <Link href="/profile">
                    <button className="bg-[#F26522] text-white px-8 py-2.5 rounded-lg hover:bg-orange-600 transition font-bold shadow-md text-sm">
                      Profil
                    </button>
                  </Link>
               )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#005DAA] p-2">
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0 z-50 animate-in slide-in-from-top-2">
            <div className="px-4 pt-4 pb-6 space-y-3 flex flex-col">
              <Link href="/" className="block">
                 <button className={`w-full text-left ${getNavClass('/')}`}>Dashboard</button>
              </Link>
              <Link href="/target" className="block">
                 <button className={`w-full text-left ${getNavClass('/target')}`}>Target Pendapatan</button>
              </Link>
              <Link href="/tickets" className="block">
                 <button className={`w-full text-left ${getNavClass('/tickets')}`}>Permasalahan Tiket</button>
              </Link>
              <hr className="border-gray-100 my-2"/>
              
              {isProfilePage ? (
                 // Ganti button Keluar mobile untuk menjalankan handleLogout
                 <button 
                   onClick={handleLogout}
                   className="block w-full text-center py-3 px-4 text-white bg-[#005DAA] rounded-lg font-bold"
                 >
                   Keluar
                 </button>
              ) : (
                 <Link href="/profile" className="block w-full text-center py-3 px-4 text-white bg-[#F26522] rounded-lg font-bold">
                   Buka Profil Saya
                 </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="w-full px-6 sm:px-10 lg:px-12 py-8 flex-grow">
        {children}
      </main>

      <footer className="w-full h-12 bg-[#005DAA] mt-auto"></footer>
    </div>
  );
}