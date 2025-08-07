import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { execute } from '../models/db.js';

const router = express.Router();

const JWT_SECRET = '27d6c4a782102fdb038cd7bf0bbaa4c11bc3a234fe9e05d8b82d185327ba73829107f83fc49c9ebfffe5a22d8097f28c1b010b2d8e234511a74c5a01b8b12b7e';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  
    return res.json({
      message: 'Login successful',
      token,
      userId: user.id,
      calories: user.dailyCalories,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
