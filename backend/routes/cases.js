// Cases routes
const express = require('express');
const router = express.Router();
const { Database } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get all cases
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status, type, search } = req.query;
        const db = new Database();
        
        let sql = 'SELECT * FROM cases WHERE 1=1';
        const params = [];

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        if (search) {
            sql += ' AND (personal_info LIKE ? OR case_info LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        sql += ' ORDER BY created_at DESC';

        const cases = await db.query(sql, params);
        
        // Parse JSON fields
        const parsedCases = cases.map(caseItem => ({
            ...caseItem,
            personalInfo: JSON.parse(caseItem.personal_info),
            caseInfo: JSON.parse(caseItem.case_info),
            additionalInfo: caseItem.additional_info ? JSON.parse(caseItem.additional_info) : null
        }));

        await db.close();
        res.json(parsedCases);
    } catch (error) {
        console.error('Get cases error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single case
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = new Database();
        
        const caseItem = await db.get('SELECT * FROM cases WHERE id = ?', [id]);

        if (!caseItem) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // Get case files
        const files = await db.query('SELECT id, file_name, file_size, file_type, uploaded_at FROM case_files WHERE case_id = ?', [id]);

        // Get case notes
        const notes = await db.query(
            'SELECT cn.*, u.username as author FROM case_notes cn LEFT JOIN users u ON cn.user_id = u.id WHERE cn.case_id = ? ORDER BY cn.created_at DESC',
            [id]
        );

        const result = {
            ...caseItem,
            personalInfo: JSON.parse(caseItem.personal_info),
            caseInfo: JSON.parse(caseItem.case_info),
            additionalInfo: caseItem.additional_info ? JSON.parse(caseItem.additional_info) : null,
            files: files.map(f => ({
                ...f,
                name: f.file_name,
                size: f.file_size,
                type: f.file_type
            })),
            notes: notes.map(n => ({
                content: n.content,
                timestamp: n.created_at,
                author: n.author || 'System'
            }))
        };

        await db.close();
        res.json(result);
    } catch (error) {
        console.error('Get case error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new case
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { id, personalInfo, caseInfo, additionalInfo } = req.body;

        if (!id || !personalInfo || !caseInfo) {
            return res.status(400).json({ error: 'Case ID, personal info, and case info are required' });
        }

        const db = new Database();

        // Check if case already exists
        const existing = await db.get('SELECT id FROM cases WHERE id = ?', [id]);
        if (existing) {
            return res.status(400).json({ error: 'Case ID already exists' });
        }

        await db.run(
            'INSERT INTO cases (id, status, personal_info, case_info, additional_info, assigned_to) VALUES (?, ?, ?, ?, ?, ?)',
            [
                id,
                req.body.status || 'pending',
                JSON.stringify(personalInfo),
                JSON.stringify(caseInfo),
                additionalInfo ? JSON.stringify(additionalInfo) : null,
                req.user.id
            ]
        );

        await db.close();
        res.status(201).json({ message: 'Case created successfully', caseId: id });
    } catch (error) {
        console.error('Create case error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update case
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, personalInfo, caseInfo, additionalInfo } = req.body;
        const db = new Database();

        const updates = [];
        const params = [];

        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }

        if (personalInfo) {
            updates.push('personal_info = ?');
            params.push(JSON.stringify(personalInfo));
        }

        if (caseInfo) {
            updates.push('case_info = ?');
            params.push(JSON.stringify(caseInfo));
        }

        if (additionalInfo !== undefined) {
            updates.push('additional_info = ?');
            params.push(additionalInfo ? JSON.stringify(additionalInfo) : null);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        await db.run(
            `UPDATE cases SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        await db.close();
        res.json({ message: 'Case updated successfully' });
    } catch (error) {
        console.error('Update case error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete case
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = new Database();

        await db.run('DELETE FROM cases WHERE id = ?', [id]);

        await db.close();
        res.json({ message: 'Case deleted successfully' });
    } catch (error) {
        console.error('Delete case error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add note to case
router.post('/:id/notes', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Note content is required' });
        }

        const db = new Database();

        await db.run(
            'INSERT INTO case_notes (case_id, user_id, content) VALUES (?, ?, ?)',
            [id, req.user.id, content]
        );

        await db.close();
        res.status(201).json({ message: 'Note added successfully' });
    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;


