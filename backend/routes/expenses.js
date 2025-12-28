// Expenses routes
const express = require('express');
const router = express.Router();
const { Database } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get all expenses
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { caseId, startDate, endDate } = req.query;
        const db = new Database();
        
        let sql = 'SELECT * FROM expenses WHERE 1=1';
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

        const expenses = await db.query(sql, params);
        await db.close();
        res.json(expenses);
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create expense
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { id, caseId, date, category, description, amount, status } = req.body;

        if (!id || !caseId || !date || !category || !description || amount === undefined) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const db = new Database();

        await db.run(
            'INSERT INTO expenses (id, case_id, user_id, date, category, description, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, caseId, req.user.id, date, category, description, amount, status || 'pending']
        );

        await db.close();
        res.status(201).json({ message: 'Expense created successfully' });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete expense
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = new Database();

        await db.run('DELETE FROM expenses WHERE id = ?', [id]);

        await db.close();
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;


