import { Router } from 'express';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { authenticationToken } from '../middleware.js';

const router = Router();

let db;
(async () => {
  db = await open({
    filename: './myappdb.sqlite',
    driver: sqlite3.Database,
  });
})();

router.post('/food', authenticationToken, async (req, res) => {
  const userId = req.user.userId;
  const { hourlyIntake, total, date } = req.body;
  const entryDate = date || new Date().toISOString().split('T')[0];

  if (!Array.isArray(hourlyIntake) || hourlyIntake.length !== 24 || total == null) {
    return res.status(400).json({ error: 'Invalid input. Provide 24-hour intake array and total.' });
  }

  try {
    const existing = await db.get('SELECT * FROM foods WHERE userId = ? AND date = ?', [userId, entryDate]);

    if (existing) {
      await db.run(
        'UPDATE foods SET hourlyIntake = ?, total = ? WHERE userId = ? AND date = ?',
        [JSON.stringify(hourlyIntake), total, userId, entryDate]
      );
      res.json({ message: 'Entry updated' });
    } else {
      const result = await db.run(
        'INSERT INTO foods (userId, hourlyIntake, total, date) VALUES (?, ?, ?, ?)',
        [userId, JSON.stringify(hourlyIntake), total, entryDate]
      );
      res.json({ id: result.lastID, userId, hourlyIntake, total, date: entryDate });
    }
  } catch (err) {
    console.error('Error in POST /food:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:userId/today', async (req, res) => {
  const { userId } = req.params;
  const today = new Date().toISOString().split('T')[0];

  try {
    let row = await db.get('SELECT * FROM foods WHERE userId = ? AND date = ?', [userId, today]);
    if (!row) {
 
      const zeroIntake = Array(24).fill(0);
      const total = 0;

      const result = await db.run(
        'INSERT INTO foods (userId, hourlyIntake, total, date) VALUES (?, ?, ?, ?)',
        [userId, JSON.stringify(zeroIntake), total, today]
      );

      row = {
        id: result.lastID,
        userId,
        hourlyIntake: zeroIntake,
        total,
        date: today,
      };
    } else {
      row.hourlyIntake = JSON.parse(row.hourlyIntake);
    }
    res.json(row);
  } catch (err) {
    console.error("Error fetching today's entry:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/:userId/today', async (req, res) => {
  const { userId } = req.params;
  const { hourlyIntake, total } = req.body;
  const today = new Date().toISOString().split('T')[0];

  if (!Array.isArray(hourlyIntake) || hourlyIntake.length !== 24 || total == null) {
    return res.status(400).json({ error: 'Invalid input. Provide 24-hour intake and total.' });
  }

  try {
    const result = await db.run(
      'UPDATE foods SET hourlyIntake = ?, total = ? WHERE userId = ? AND date = ?',
      [JSON.stringify(hourlyIntake), total, userId, today]
    );

    if (result.changes > 0) {
      res.json({ message: 'Entry updated' });
    } else {
    
      const insertResult = await db.run(
        'INSERT INTO foods (userId, hourlyIntake, total, date) VALUES (?, ?, ?, ?)',
        [userId, JSON.stringify(hourlyIntake), total, today]
      );
      res.json({ message: 'Entry created', id: insertResult.lastID });
    }
  } catch (err) {
    console.error('Error updating entry:', err);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});
router.get('/user/:userId/date/:date', async (req, res) => {
  const { userId, date } = req.params;

  try {
    const row = await db.get('SELECT * FROM foods WHERE userId = ? AND date = ?', [userId, date]);
    if (!row) {
      return res.json(Array(24).fill(0));
    }
    const hourly = JSON.parse(row.hourlyIntake || '[]');
    res.json(hourly.length === 24 ? hourly : Array(24).fill(0));
  } catch (err) {
    console.error('Error fetching intake by date:', err);
    res.status(500).json({ error: 'Database error' });
  }
});
router.get('/weekly-intake/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const rows = await db.all(
      `SELECT date, total FROM foods WHERE userId = ? ORDER BY date DESC LIMIT 7`,
      [userId]
    );

    const data = rows.reverse().map(row => ({
      date: row.date,
      totalCalories: row.total || 0
    }));

    res.json(data);
  } catch (err) {
    console.error('Error fetching weekly intake:', err);
    res.status(500).json({ error: 'Failed to fetch weekly intake' });
  }
});



export default router;
