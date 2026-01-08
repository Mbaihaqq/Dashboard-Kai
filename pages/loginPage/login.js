// pages/loginPage/login.js
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Eye, EyeOff } from 'lucide-react';
import ReCAPTCHA from "react-google-recaptcha";
import { supabase } from '../../lib/supabaseClient'; // Pastikan import ini benar

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  // State untuk Input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCaptchaChange = (value) => {
    if (value) setIsVerified(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isVerified) return;
    setLoading(true);

    try {
      // PROSES LOGIN RESMI KE SUPABASE AUTH
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      // Jika sukses, simpan sesi sementara dan masuk ke dashboard
      sessionStorage.setItem('isLoggedIn', 'true');
      router.push('/');
    } catch (error) {
      alert("Login Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans">
      
      {/* SEKSI KIRI: FORM */}
      <div className="w-full md:w-1/2 bg-white flex flex-col relative">
        
        {/* Konten Utama */}
        <div className="flex-grow flex flex-col justify-center px-8 sm:px-16 lg:px-24">
            
            {/* Logo KAI & Daop 4 */}
            <div className="flex items-center gap-4 mb-8">
              <img src="/logo-kai.png" alt="Logo KAI" className="h-10 w-auto object-contain" />
              <img src="/logo-daop4.png" alt="Logo Daop 4" className="h-12 w-auto object-contain" />
            </div>

            <h1 className="text-3xl font-bold text-black mb-1">Selamat datang kembali!</h1>
            <p className="text-gray-400 text-sm mb-8">Mohon isi kembali data anda</p>

            <form className="space-y-4 max-w-md" onSubmit={handleLogin}>
                {/* Email Pegawai */}
                <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Email Pegawai *</label>
                    <input 
                        required 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Masukkan Email" 
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
                            placeholder="Masukkan Password" 
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

                {/* Captcha */}
                <div className="my-4">
                  <ReCAPTCHA 
                    sitekey="6LeLV0QsAAAAADCUL70dQYCoh-U5-EYK1fvZyWdZ" 
                    onChange={handleCaptchaChange} 
                  />
                </div>

                {/* Button Login */}
                <button 
                  type="submit" 
                  disabled={!isVerified || loading}
                  className={`w-full font-bold py-3 rounded-lg transition shadow-md ${
                    isVerified && !loading ? 'bg-[#005DAA] text-white hover:bg-blue-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? "Memproses..." : "Login"}
                </button>

                {/* TOMBOL DAFTAR (Ini yang tadinya hilang) */}
                <p className="text-center text-sm text-black font-medium pt-2">
                    Belum punya akun? <Link href="/loginPage/register" className="text-[#F26522] hover:underline font-bold">Daftar</Link>
                </p>

            </form>
        </div>

        {/* Footer Biru */}
        <div className="h-10 w-full bg-[#005DAA] absolute bottom-0 left-0"></div>
      </div>

      {/* SEKSI KANAN: GAMBAR */}
      <div className="hidden md:block w-1/2 relative h-full">
         <img src="/train-worker.jpeg" alt="Login Background" className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-black/25"></div> 
         <div className="absolute top-[20%] left-12 right-12 text-white">
            <h2 className="text-5xl font-bold leading-tight drop-shadow-xl">Yuk masuk ke <br/> akun mu <br/> kembali</h2>
         </div>
      </div>

    </div>
  );
}