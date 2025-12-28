// Trust transactions routes
const express = require('express');
const router = express.Router();
const { Database } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get all trust transactions
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { caseId, startDate, endDate } = req.query;
        const db = new Database();
        
        let sql = 'SELECT * FROM trust_transactions WHERE 1=1';
        const params = [];

        if (caseId) {
            sql += ' AND case_id = ?';
            params.push(caseId);
        }

        if (startDate) {
            sql += ' AND date >= ?';
            params.push(startDate);
        }

        if (endDate) {
            sql += ' AND date <= ?';
            params.push(endDate);
        }

        sql += ' ORDER BY date DESC';

        const transactions = await db.query(sql, params);
        await db.close();
        res.json(transactions);
    } catch (error) {
        console.error('Get trust transactions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create trust transaction
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { id, caseId, date, type, amount, description } = req.body;

        if (!id || !caseId || !date || !type || amount === undefined) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        if (!['deposit', 'withdrawal', 'transfer'].includes(type)) {
            return res.status(400).json({ error: 'Invalid transaction type' });
        }

        const db = new Database();

        await db.run(
            'INSERT INTO trust_transactions (id, case_id, user_id, date, type, amount, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, caseId, req.user.id, date, type, amount, description || null]
        );

        await db.close();
        res.status(201).json({ message: 'Trust transaction created successfully' });
    } catch (error) {
        console.error('Create trust transaction error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete trust transaction
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = new Database();

        await db.run('DELETE FROM trust_transactions WHERE id = ?', [id]);

        await db.close();
        res.json({ message: 'Trust transaction deleted successfully' });
    } catch (error) {
        console.error('Delete trust transaction error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;


