// pages/loginPage/register.js
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient'; // Pastikan file ini sudah benar

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  // State untuk Input
  const [email, setEmail] = useState(''); // Supabase Auth butuh Email
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nip, setNip] = useState('');
  const [position, setPosition] = useState('Staff'); // State baru untuk Jabatan
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Daftarkan User ke Supabase Authenticator (auth.users)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      // 2. Jika Auth berhasil, simpan data tambahan ke tabel 'profiles'
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: authData.user.id, // ID diambil dari akun Auth yang baru dibuat
              username: username, 
              nip: nip, 
              position: position, // Menyimpan jabatan yang dipilih
              role: 'user'      // Default role
            }
          ]);

        if (profileError) throw profileError;
      }

      alert("Registrasi Berhasil! Silakan Login.");
      router.push('/loginPage/login');
      
    } catch (error) {
      alert("Gagal daftar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans">
      
      {/* SEKSI KIRI: FORM */}
      <div className="w-full md:w-1/2 bg-white flex flex-col relative">
        <div className="flex-grow flex flex-col justify-center px-8 sm:px-16 lg:px-24">
            
            <div className="flex items-center gap-4 mb-8">
              <img src="/logo-kai.png" alt="Logo KAI" className="h-10 w-auto object-contain" />
              <img src="/logo-daop4.png" alt="Logo Daop 4" className="h-12 w-auto object-contain" />
            </div>

            <h1 className="text-3xl font-bold text-black mb-1">Daftar Akun!</h1>
            <p className="text-gray-400 text-sm mb-8">Silahkan Masukan Data Anda untuk Autentikasi</p>

            <form className="space-y-4 max-w-md" onSubmit={handleRegister}>
                {/* Email (Wajib untuk Supabase Auth) */}
                <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Email Pegawai *</label>
                    <input 
                        required
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh@kai.id" 
                        className="w-full border border-gray-400 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] transition-colors"
                    />
                </div>

                {/* Username */}
                <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Username *</label>
                    <input 
                        required
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Masukan Username" 
                        className="w-full border border-gray-400 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] transition-colors"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Password *</label>
                    <div className="relative">
                        <input 
                            required
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukan Password" 
                            className="w-full border border-gray-400 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] pr-10 transition-colors"
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-500 hover:text-black transition"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Nomor Induk Pegawai */}
                <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Nomor Induk Pegawai *</label>
                    <input 
                        required
                        type="text" 
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        placeholder="Masukan Nomor Induk Pegawai" 
                        className="w-full border border-gray-400 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] transition-colors"
                    />
                </div>

                {/* Jabatan - Input Baru */}
                <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Jabatan *</label>
                    <select 
                        required
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="w-full border border-gray-400 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] bg-white"
                    >
                        <option value="Staff">Staff</option>
                        <option value="Manager">Manager</option>
                        <option value="Senior Manager">Senior Manager</option>
                        <option value="Vice President">Vice President</option>
                    </select>
                </div>

                <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#005DAA] text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition shadow-md disabled:bg-gray-400"
                    >
                        {loading ? "Memproses..." : "Buat Akun"}
                    </button>
                </div>
            </form>
        </div>
        <div className="h-10 w-full bg-[#005DAA] absolute bottom-0 left-0"></div>
      </div>

      {/* SEKSI KANAN: GAMBAR */}
      <div className="hidden md:block w-1/2 relative h-full">
         <img src="/train-worker.jpeg" alt="Background" className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-black/25"></div>
         <div className="absolute top-[20%] left-12 right-12">
            <h2 className="text-5xl font-bold text-white leading-tight drop-shadow-xl">Mari daftarkan <br/> akunmu!</h2>
         </div>
      </div>
    </div>
  );
}