// Invoices routes
const express = require('express');
const router = express.Router();
const { Database } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get all invoices
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { caseId, status, startDate, endDate } = req.query;
        const db = new Database();
        
        let sql = 'SELECT * FROM invoices WHERE 1=1';
        const params = [];

        if (caseId) {
            sql += ' AND case_id = ?';
            params.push(caseId);
        }

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
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

        const invoices = await db.query(sql, params);
        await db.close();
        res.json(invoices);
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create invoice
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { id, invoiceNumber, caseId, date, dueDate, amount, status } = req.body;

        if (!id || !invoiceNumber || !caseId || !date || amount === undefined) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        const db = new Database();

        await db.run(
            'INSERT INTO invoices (id, invoice_number, case_id, date, due_date, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, invoiceNumber, caseId, date, dueDate || null, amount, status || 'pending']
        );

        await db.close();
        res.status(201).json({ message: 'Invoice created successfully' });
    } catch (error) {
        console.error('Create invoice error:', error);
        if (error.message.includes('UNIQUE constraint')) {
            return res.status(400).json({ error: 'Invoice number already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update invoice status
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const db = new Database();

        await db.run('UPDATE invoices SET status = ? WHERE id = ?', [status, id]);

        await db.close();
        res.json({ message: 'Invoice updated successfully' });
    } catch (error) {
        console.error('Update invoice error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;


