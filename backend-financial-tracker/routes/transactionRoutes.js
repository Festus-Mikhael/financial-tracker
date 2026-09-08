const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// 1. TAMBAH TRANSAKSI BARU (Protected Route)
router.post('/', authenticateToken, async (req, res) => {
  const { title, amount, type, category } = req.body;
  const userId = req.user.id; // Diambil otomatis dari token JWT

  try {
    const newTransaction = await pool.query(
      `INSERT INTO transactions (user_id, title, amount, type, category) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, title, amount, type, category]
    );

    res.status(201).json({
      message: 'Transaksi berhasil ditambahkan',
      transaction: newTransaction.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. AMBIL SEMUA TRANSAKSI MILIK USER (Protected Route)
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const transactions = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      message: 'Data transaksi berhasil diambil',
      transactions: transactions.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. HAPUS TRANSAKSI (Protected Route)
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan atau Anda tidak memiliki akses.' });
    }

    res.json({ message: 'Transaksi berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. HITUNG RINGKASAN SALDO & TOTAL (Protected Route)
// Catatan: Route '/summary' diletakkan di atas '/:id' agar tidak disangka sebagai parameter ID
router.get('/summary', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const summary = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
       FROM transactions 
       WHERE user_id = $1`,
      [userId]
    );

    const totalIncome = parseFloat(summary.rows[0].total_income);
    const totalExpense = parseFloat(summary.rows[0].total_expense);
    const balance = totalIncome - totalExpense;

    res.json({
      message: 'Ringkasan keuangan berhasil dihitung',
      summary: {
        total_income: totalIncome,
        total_expense: totalExpense,
        balance: balance
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. UPDATE / EDIT TRANSAKSI (Protected Route)
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, amount, type, category, date } = req.body; // Tambah date
  const userId = req.user.id;

  try {
    const updatedTransaction = await pool.query(
      `UPDATE transactions 
       SET title = $1, amount = $2, type = $3, category = $4, created_at = $5
       WHERE id = $6 AND user_id = $7 
       RETURNING *`,
      [title, amount, type, category, date, id, userId]
    );

    if (updatedTransaction.rowCount === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan atau Anda tidak memiliki akses.' });
    }

    res.json({
      message: 'Transaksi berhasil diperbarui',
      transaction: updatedTransaction.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { title, amount, type, category, date } = req.body; // Tambah date
  const userId = req.user.id;

  try {
    // Jika date tidak diisi, gunakan tanggal hari ini (CURRENT_DATE)
    const transactionDate = date || new Date().toISOString().split('T')[0];

    const newTransaction = await pool.query(
      `INSERT INTO transactions (user_id, title, amount, type, category, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, title, amount, type, category, transactionDate]
    );

    res.status(201).json({
      message: 'Transaksi berhasil ditambahkan',
      transaction: newTransaction.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;