// pages/verify-email.js
import Link from 'next/link';
import { Mail } from 'lucide-react';
import Head from 'next/head';

export default function VerifyEmail() {
  return (
    <>
      <Head>
        <title>Verifikasi Email - Monitoring Hazard</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans animate-fadeIn">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
          
          {/* Ikon Amplop Email */}
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Mail className="text-[#005DAA]" size={40} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Cek Email Anda
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Kami telah mengirimkan tautan verifikasi ke alamat email Anda. 
            Silakan periksa kotak masuk (atau folder spam) dan klik tautan tersebut untuk mengaktifkan akun.
          </p>
          
          <Link 
            href="/loginPage/login" 
            className="inline-block w-full bg-[#005DAA] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-md hover:shadow-lg"
          >
            Kembali ke Halaman Login
          </Link>

          <p className="mt-6 text-sm text-gray-400">
            Belum menerima email? Coba periksa kembali penulisan email Anda saat mendaftar.
          </p>
        </div>
      </div>
    </>
  );
}