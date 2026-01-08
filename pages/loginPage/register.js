// pages/loginPage/register.js
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  // State Input
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nip, setNip] = useState('');
  const [position, setPosition] = useState('Staff');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Paksa Logout Sesi Lama (Mencegah token lama yang bikin bentrok)
      await supabase.auth.signOut();

      // 2. Daftarkan ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (authError) throw authError;

      const userId = authData?.user?.id;

      if (userId) {
        // 3. JEDA SINKRONISASI (2 Detik)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // 4. Gunakan UPSERT untuk menyimpan data profil
        // Ini akan mengupdate data jika ID sudah ada, atau buat baru jika belum ada
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            { 
              id: userId, 
              username: username.trim(), 
              nip: nip.trim(), // Memastikan NIP masuk
              position: position, 
              role: 'user'
            },
            { onConflict: 'id' } // Solusi untuk error "duplicate key"
          );

        if (profileError) {
          console.error("Detail Error Database:", profileError.message);
          throw new Error(`Data Profil gagal disimpan: ${profileError.message}`);
        }
      }

      alert("Registrasi Berhasil! Username, NIP, dan Jabatan telah terdaftar.");
      router.push('/loginPage/login');
      
    } catch (error) {
      alert("Gagal Daftar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans bg-white text-black">
      
      {/* SEKSI KIRI: FORM */}
      <div className="w-full md:w-1/2 flex flex-col h-full overflow-y-auto">
        <div className="flex-grow flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12">
            
            <div className="flex items-center gap-4 mb-8">
              <img src="/logo-kai.png" alt="Logo KAI" className="h-10 w-auto object-contain" />
              <img src="/logo-daop4.png" alt="Logo Daop 4" className="h-12 w-auto object-contain" />
            </div>

            <h1 className="text-3xl font-bold mb-1 uppercase tracking-tight text-[#005DAA]">Daftar Akun!</h1>
            <p className="text-gray-400 text-sm mb-8">Masukkan data Anda untuk akses monitoring DAOP 4 Semarang</p>

            <form className="space-y-4 max-w-md" onSubmit={handleRegister}>
                <div>
                    <label className="block text-sm font-bold mb-1.5">Email Pegawai *</label>
                    <input 
                        required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh@kai.id" 
                        className="w-full border border-gray-400 rounded-lg px-4 py-2.5 focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-1.5">Username *</label>
                    <input 
                        required type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username" 
                        className="w-full border border-gray-400 rounded-lg px-4 py-2.5 focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-1.5">Password *</label>
                    <div className="relative">
                        <input 
                            required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 Karakter" 
                            className="w-full border border-gray-400 rounded-lg px-4 py-2.5 pr-10 focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] outline-none"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500 hover:text-black">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-1.5">Nomor Induk Pegawai (NIP) *</label>
                    <input 
                        required type="text" value={nip} onChange={(e) => setNip(e.target.value)}
                        placeholder="Masukkan NIP" 
                        className="w-full border border-gray-400 rounded-lg px-4 py-2.5 focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-1.5">Jabatan *</label>
                    <select 
                        required value={position} onChange={(e) => setPosition(e.target.value)}
                        className="w-full border border-gray-400 rounded-lg px-4 py-2.5 bg-white focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] outline-none"
                    >
                        <option value="Staff">Staff</option>
                        <option value="Manager">Manager</option>
                        <option value="Senior Manager">Senior Manager</option>
                        <option value="Vice President">Vice President</option>
                    </select>
                </div>

                <div className="pt-4 pb-12">
                    <button 
                      type="submit" disabled={loading}
                      className="w-full bg-[#005DAA] text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition shadow-md disabled:bg-gray-400 uppercase tracking-wider"
                    >
                        {loading ? "Sedang Memproses..." : "Buat Akun KAI"}
                    </button>
                    <p className="text-center text-sm text-gray-500 mt-4">
                        Sudah punya akun? <Link href="/loginPage/login" className="text-[#005DAA] font-bold hover:underline">Masuk di sini</Link>
                    </p>
                </div>
            </form>
        </div>
        
        <div className="h-10 w-full bg-[#005DAA] flex-shrink-0"></div>
      </div>

      <div className="hidden md:block w-1/2 relative h-full">
         <img src="/train-worker.jpeg" alt="Background" className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-black/30"></div>
         <div className="absolute top-[20%] left-12 right-12 text-white">
            <h2 className="text-5xl font-bold leading-tight drop-shadow-2xl uppercase tracking-tighter">Mari daftarkan <br/> akun pegawai <br/> Anda!</h2>
         </div>
      </div>
    </div>
  );
}