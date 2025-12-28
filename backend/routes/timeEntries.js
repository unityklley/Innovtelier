// Time entries routes
const express = require('express');
const router = express.Router();
const { Database } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get all time entries
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { caseId, startDate, endDate } = req.query;
        const db = new Database();
        
        let sql = 'SELECT * FROM time_entries WHERE 1=1';
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

        const entries = await db.query(sql, params);
        await db.close();
        res.json(entries);
    } catch (error) {
        console.error('Get time entries error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create time entry
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { id, caseId, date, description, hours, rate, billable } = req.body;

        if (!id || !caseId || !date || !description || hours === undefined || rate === undefined) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const db = new Database();

        await db.run(
            'INSERT INTO time_entries (id, case_id, user_id, date, description, hours, rate, billable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, caseId, req.user.id, date, description, hours, rate, billable ? 1 : 0]
        );

        await db.close();
        res.status(201).json({ message: 'Time entry created successfully' });
    } catch (error) {
        console.error('Create time entry error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete time entry
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = new Database();

        await db.run('DELETE FROM time_entries WHERE id = ?', [id]);

        await db.close();
        res.json({ message: 'Time entry deleted successfully' });
    } catch (error) {
        console.error('Delete time entry error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;


