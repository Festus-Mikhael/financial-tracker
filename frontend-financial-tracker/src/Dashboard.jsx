import { useState, useEffect } from 'react';
import API from './api';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  LogOut, 
  Calendar, 
  X,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard({ onLogout }) {
  // --- STATE DATA ---
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- STATE FORM ---
  const today = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Makanan');
  const [date, setDate] = useState(today);
  const [editingId, setEditingId] = useState(null);

  // --- STATE FILTER ---
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // --- STYLE SERAGAM UNTUK INPUT (Menghilangkan Warna Hitam) ---
  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    backgroundColor: '#ffffff', // Latar Putih
    color: '#0f172a',            // Teks Gelap
    border: '1px solid #cbd5e1', // Border Tipis Abu-abu
    borderRadius: '6px',
    fontSize: '13px',
    boxSizing: 'border-box',
    outline: 'none'
  };

  // --- FORMATTER ---
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(number || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // 1. FETCH DATA
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resTrans, resSummary] = await Promise.all([
        API.get('/transactions'),
        API.get('/transactions/summary')
      ]);

      setTransactions(resTrans.data.transactions || []);
      setSummary(resSummary.data.summary || { total_income: 0, total_expense: 0, balance: 0 });
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim()) return alert('Judul transaksi tidak boleh kosong.');
    if (isNaN(parsedAmount) || parsedAmount <= 0) return alert('Nominal harus lebih dari 0.');

    try {
      const payload = { title, amount: parsedAmount, type, category, date };

      if (editingId) {
        await API.put(`/transactions/${editingId}`, payload);
      } else {
        await API.post('/transactions', payload);
      }

      resetForm();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan transaksi.');
    }
  };

  // 3. HAPUS TRANSAKSI
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus transaksi ini?')) return;
    try {
      await API.delete(`/transactions/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus transaksi.');
    }
  };

  // 4. START EDIT
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setAmount(item.amount);
    setType(item.type);
    setCategory(item.category);
    const formattedDate = new Date(item.created_at).toISOString().split('T')[0];
    setDate(formattedDate);
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setType('expense');
    setCategory('Makanan');
    setDate(today);
    setEditingId(null);
  };

  // 5. FILTERING LOGIC
  const filteredTransactions = transactions.filter((item) => {
    const matchType = filterType === 'all' || item.type === filterType;
    const matchCategory = filterCategory === 'all' || item.category.toLowerCase() === filterCategory.toLowerCase();
    const itemDate = new Date(item.created_at).toISOString().split('T')[0];
    const matchDate = !filterDate || itemDate === filterDate;
    return matchType && matchCategory && matchDate;
  });

  return (
    <div style={{ backgroundColor: '#f8faf9', minHeight: '100vh', padding: '30px 20px', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', color: '#1a1a1a' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet style={{ color: '#16a34a' }} size={24} /> Finance Tracker
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Kelola arus kas harian Anda secara efisien</p>
          </div>
          <button 
            onClick={onLogout} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#ffffff', color: '#dc2626', border: '1px solid #fee2e2', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
          >
            <LogOut size={15} /> Logout
          </button>
        </header>

        {/* SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '30px' }}>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Sisa Saldo</span>
              <Wallet size={18} style={{ color: '#16a34a' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: summary.balance < 0 ? '#dc2626' : '#0f172a', margin: '12px 0 0 0' }}>
              {formatRupiah(summary.balance)}
            </h2>
          </div>

          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Total Pemasukan</span>
              <ArrowUpCircle size={18} style={{ color: '#16a34a' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a', margin: '12px 0 0 0' }}>
              {formatRupiah(summary.total_income)}
            </h2>
          </div>

          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Total Pengeluaran</span>
              <ArrowDownCircle size={18} style={{ color: '#dc2626' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626', margin: '12px 0 0 0' }}>
              {formatRupiah(summary.total_expense)}
            </h2>
          </div>
        </div>

        {/* FORM INPUT / EDIT (SUDAH DIPERBAIKI GAYA INPUT-NYA) */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editingId ? <Edit2 size={16} style={{ color: '#ca8a04' }} /> : <Plus size={16} style={{ color: '#16a34a' }} />}
            {editingId ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Judul Transaksi</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Contoh: Pembelian Perlengkapan"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Nominal (Rp)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  placeholder="0"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Tipe</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  style={inputStyle}
                >
                  <option value="expense">Pengeluaran</option>
                  <option value="income">Pemasukan</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Kategori</label>
                <input 
                  type="text" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  placeholder="Makanan, Transport, dll"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Tanggal</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '9px 16px', background: editingId ? '#ca8a04' : '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                >
                  {editingId ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                  {editingId ? 'Update' : 'Simpan'}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={resetForm} 
                    style={{ padding: '9px 12px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Batal
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* TABEL DATA */}
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>Riwayat Transaksi</h3>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}>
                <Calendar size={14} style={{ color: '#64748b' }} />
                <input 
                  type="date" 
                  value={filterDate} 
                  onChange={(e) => setFilterDate(e.target.value)} 
                  style={{ border: 'none', outline: 'none', fontSize: '12px', color: '#0f172a', backgroundColor: '#ffffff' }}
                />
                {filterDate && (
                  <X size={14} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setFilterDate('')} />
                )}
              </div>

              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)} 
                style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: '12px' }}
              >
                <option value="all">Semua Tipe</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>

              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)} 
                style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: '12px' }}
              >
                <option value="all">Semua Kategori</option>
                {[...new Set(transactions.map(t => t.category))].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Memuat data...</div>
          ) : error ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#dc2626', fontSize: '13px' }}>{error}</div>
          ) : filteredTransactions.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Tidak ada data transaksi ditemukan.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600' }}>
                    <th style={{ padding: '12px 20px' }}>Nama Transaksi</th>
                    <th style={{ padding: '12px 16px' }}>Tipe</th>
                    <th style={{ padding: '12px 16px' }}>Kategori</th>
                    <th style={{ padding: '12px 16px' }}>Tanggal</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Nominal</th>
                    <th style={{ padding: '12px 20px', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0f172a' }}>{item.title}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '4px', 
                          fontSize: '11px', 
                          fontWeight: '600',
                          backgroundColor: item.type === 'income' ? '#dcfce7' : '#fee2e2',
                          color: item.type === 'income' ? '#15803d' : '#b91c1c'
                        }}>
                          {item.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontSize: '12px' }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{formatDate(item.created_at)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: item.type === 'income' ? '#16a34a' : '#0f172a' }}>
                        {item.type === 'income' ? '+' : '-'} {formatRupiah(item.amount)}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button onClick={() => handleStartEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}