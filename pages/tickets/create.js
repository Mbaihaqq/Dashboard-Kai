// pages/tickets/create.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient'; //

export default function CreateTicket() {
  const router = useRouter();
  
  // State sesuai tabel tickets
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('Belum');
  const [loading, setLoading] = useState(false);

  const handleSimpanTicket = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('tickets') //
        .insert([
          { 
            customer_name: nama, 
            phone_number: telepon, 
            email: email, 
            status: status 
          }
        ]);

      if (error) throw error;

      alert("Data Tiket Berhasil Disimpan!");
      router.push('/tickets');
    } catch (error) {
      alert("Gagal simpan tiket: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* REVISI: Gunakan 'w-full max-w-5xl' agar lebar input konsisten dengan halaman Target Input */}
      <div className="w-full max-w-5xl">
        
        <h1 className="text-3xl font-bold text-black mb-1">Permasalahan Tiket</h1>
        <p className="text-sm text-gray-500 mb-8">Silahkan Input Data Permasalahan Tiket</p>

        <form className="space-y-6" onSubmit={handleSimpanTicket}>
          
          {/* Field Nama */}
          <div>
            <label className="block text-base font-bold text-black mb-2">
              Nama Customer <span className="text-red-500">*</span>
            </label>
            <input 
              required
              type="text" 
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama..."
              className="w-full border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] transition-colors text-black" 
            />
          </div>

          {/* Field Telepon */}
          <div>
            <label className="block text-base font-bold text-black mb-2">
              Nomor Telepon Customer <span className="text-red-500">*</span>
            </label>
            <input 
              required
              type="text" 
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              placeholder="Contoh: 0812..."
              className="w-full border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] transition-colors text-black"
            />
          </div>

          {/* Field Email */}
          <div>
            <label className="block text-base font-bold text-black mb-2">
              Email Customer <span className="text-red-500">*</span>
            </label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: email@gmail.com"
              className="w-full border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] transition-colors text-black"
            />
          </div>

           {/* Field Status */}
           <div>
            <label className="block text-base font-bold text-black mb-2">
              Status Awal <span className="text-red-500">*</span>
            </label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:border-[#005DAA] focus:ring-1 focus:ring-[#005DAA] transition-colors bg-white text-black"
            >
                <option value="Belum">Belum</option>
                <option value="Selesai">Selesai</option>
            </select>
          </div>

          {/* Tombol Action (Center Relative to Input Width) */}
          <div className="pt-8 flex justify-center gap-4">
            
            {/* Tombol Batal */}
             <Link href="/tickets">
                <button 
                  type="button" 
                  className="bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-lg hover:bg-gray-300 transition shadow-md"
                >
                  Batal
                </button>
             </Link>

            {/* Tombol Simpan */}
            <button 
                type="submit" 
                disabled={loading}
                className="bg-[#005DAA] text-white font-bold py-3 px-12 rounded-lg hover:bg-blue-800 transition shadow-md w-full md:w-auto md:min-w-[200px]"
            >
                {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>

        </form>
      </div>
    </Layout>
  );
}