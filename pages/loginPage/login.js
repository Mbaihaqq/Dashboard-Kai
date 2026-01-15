import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Eye, EyeOff } from 'lucide-react';
import ReCAPTCHA from "react-google-recaptcha";
import { supabase } from '../../lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCaptchaChange = (value) => { if (value) setIsVerified(true); };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isVerified) return;
    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile } = await supabase.from('profiles').select('status, role').eq('id', user.id).single();
      
      if (profile?.status === 'pending') {
        await supabase.auth.signOut();
        alert("Akun Anda belum disetujui oleh admin. Silahkan hubungi admin.");
        return;
      }

      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userRole', profile.role);
      router.push('/');
    } catch (error) {
      alert("Login Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans bg-white">
      <div className="w-full md:w-1/2 bg-white flex flex-col relative">
        <div className="flex-grow flex flex-col justify-center px-8 sm:px-16 lg:px-24">
            <div className="flex items-center gap-4 mb-8">
              <img src="/logo-kai.png" alt="Logo KAI" className="h-10 w-auto object-contain" />
              <img src="/logo-daop4.png" alt="Logo Daop 4" className="h-12 w-auto object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-black mb-1">Selamat datang kembali!</h1>
            <p className="text-gray-400 text-sm mb-8">Mohon isi kembali data anda</p>
            <form className="space-y-4 max-w-md" onSubmit={handleLogin}>
                <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Email Pegawai *</label>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Masukkan Email" 
                    className="w-full border border-gray-400 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] transition-colors" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-black mb-1.5">Password *</label>
                    <div className="relative">
                        <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan Password" 
                        className="w-full border border-gray-400 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] pr-10 transition-colors" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500 hover:text-black">
                           {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                <div className="my-4">
                  <ReCAPTCHA sitekey="6LeXeEQsAAAAAJch-ogguT2KWKDs9udnr4os6W6D" onChange={handleCaptchaChange} />
                </div>
                <button type="submit" disabled={!isVerified || loading}
                  className={`w-full font-bold py-3 rounded-lg transition shadow-md ${isVerified && !loading ? 'bg-[#005DAA] text-white hover:bg-blue-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                  {loading ? "Memproses..." : "Login"}
                </button>
                <p className="text-center text-sm text-black font-medium pt-2">
                    Belum punya akun? <Link href="/loginPage/register" className="text-[#F26522] hover:underline font-bold">Daftar</Link>
                </p>
            </form>
        </div>
        <div className="h-10 w-full bg-[#005DAA] absolute bottom-0 left-0"></div>
      </div>
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