import { Router } from 'express';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { run, execute } from '../models/db.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || '27d6c4a782102fdb038cd7bf0bbaa4c11bc3a234fe9e05d8b82d185327ba73829107f83fc49c9ebfffe5a22d8097f28c1b010b2d8e234511a74c5a01b8b12b7e';




router.post('/register', async (req, res) => {
  try {
    const { email, password, dailyCalories } = req.body;

    if (!email || !password || !dailyCalories) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUsers = await execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await hash(password, 10);

    const result = await run(
      'INSERT INTO users (email, password, dailyCalories) VALUES (?, ?, ?)',
      [email, hashedPassword, dailyCalories]
    );

    const userId = result.lastID;

  
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered',
      userId,
      token,
      calories: dailyCalories
    });
  } catch (error) {
    console.error('Error in /register:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * User Login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const rows = await execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      userId: user.id,
      token,
      calories: user.dailyCalories
    });
  } catch (error) {
    console.error('Error in /login:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
