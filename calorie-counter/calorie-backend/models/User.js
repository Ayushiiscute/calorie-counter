import { run, execute } from './db.js';
import { hash } from 'bcrypt';

const User = {
  async create(email, password, dailyCalories) {
    const hashedPassword = await hash(password, 10);
    const result = await run(
      'INSERT INTO users (email, password, dailyCalories) VALUES (?, ?, ?)',
      [email, hashedPassword, dailyCalories]
    );
    return { id: result.lastID, email, dailyCalories };
  },

  async findByEmail(email) {
    const rows = await execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }
};

export default User;
