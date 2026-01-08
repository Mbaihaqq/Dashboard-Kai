// pages/target/input.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function InputTarget() {
  const router = useRouter();
  
  const [date, setDate] = useState('');
  const [targetRevenue, setTargetRevenue] = useState('');
  const [actualRevenue, setActualRevenue] = useState('');
  const [loading, setLoading] = useState(false);

  // Fungsi Format: Menambahkan "Rp " di depan angka secara otomatis
  const formatRupiah = (value) => {
    if (!value) return '';
    const numberString = value.replace(/[^0-9]/g, '');
    if (!numberString) return '';
    
    const formatted = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp ${formatted}`; 
  };

  // Fungsi untuk membersihkan semua karakter kecuali angka sebelum simpan ke database
  const cleanNumber = (val) => val.replace(/[^0-9]/g, '');

  const handleSimpan = async (e) => {
    e.preventDefault();

    const valTarget = parseInt(cleanNumber(targetRevenue));
    const valActual = parseInt(cleanNumber(actualRevenue));

    // Validasi: Tidak boleh 0 atau Minus
    if (isNaN(valTarget) || valTarget <= 0 || isNaN(valActual) || valActual <= 0) {
      alert("Nominal pendapatan harus lebih besar dari 0 dan tidak boleh minus!");
      return;
    }

    setLoading(true);

    try {
      // 1. Ambil info user yang sedang login
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // 2. Simpan data ke tabel daily_targets
      const { error } = await supabase
        .from('daily_targets')
        .insert([
          { 
            date: date, 
            target_revenue: valTarget, 
            actual_revenue: valActual,
            user_id: user.id // Menandai bahwa data ini milik user yang sedang login
          }
        ]);

      if (error) throw error;

      alert("Data berhasil disimpan ke database!");
      router.push('/target');
    } catch (error) {
      alert("Gagal menyimpan data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-5xl">
        
        {/* HEADER */}
        <div className="mb-10">
            <h1 className="text-3xl font-bold text-black mb-1">Target Pendapatan</h1>
            <p className="text-sm text-gray-500">Silahkan Input Data Target Pendapatan & Data Aktual Lapangan</p>
        </div>

        {/* FORM INPUT */}
        <form className="space-y-8" onSubmit={handleSimpan}>
            
            {/* Input Tanggal */}
            <div>
                <label className="block text-base font-bold text-black mb-2">
                    Tanggal <span className="text-red-500">*</span>
                </label>
                <input 
                    required
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-400 rounded-lg px-4 py-3 text-[#4B5563] focus:outline-none focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] transition-colors"
                />
            </div>

            {/* Input Target Pendapatan */}
            <div>
                <label className="block text-base font-bold text-black mb-2">
                    Target Pendapatan <span className="text-red-500">*</span>
                </label>
                <input 
                    required
                    type="text" 
                    placeholder="Rp 455.000.000"
                    value={targetRevenue}
                    onChange={(e) => setTargetRevenue(formatRupiah(e.target.value))}
                    className="w-full border border-gray-400 rounded-lg px-4 py-3 text-[#4B5563] font-bold text-lg focus:outline-none focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] transition-colors"
                />
            </div>

            {/* Input Pendapatan Aktual */}
            <div>
                <label className="block text-base font-bold text-black mb-2">
                    Pendapatan Aktual <span className="text-red-500">*</span>
                </label>
                <input 
                    required
                    type="text" 
                    placeholder="Rp 400.000.000"
                    value={actualRevenue}
                    onChange={(e) => setActualRevenue(formatRupiah(e.target.value))}
                    className="w-full border border-gray-400 rounded-lg px-4 py-3 text-[#4B5563] font-bold text-lg focus:outline-none focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] transition-colors"
                />
            </div>

            {/* TOMBOL AKSI */}
            <div className="pt-8 flex items-center justify-center gap-4">
                <Link href="/target">
                  <button 
                    type="button"
                    className="bg-gray-200 text-[#4B5563] font-bold py-3 px-12 rounded-lg hover:bg-gray-300 transition text-lg"
                  >
                      Batal
                  </button>
                </Link>

                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-[#005DAA] text-white font-bold py-3 px-12 rounded-lg hover:bg-blue-800 transition shadow-md text-lg disabled:bg-gray-400"
                >
                    {loading ? "Memproses..." : "Simpan Data"}
                </button>
            </div>
        </form>
      </div>
    </Layout>
  );
}