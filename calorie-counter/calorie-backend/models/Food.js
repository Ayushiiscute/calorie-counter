import { run, execute } from './db.js';

const sanitizeIntake = (intakeArray) => {
  if (!Array.isArray(intakeArray)) return Array(24).fill(0);
  return intakeArray.map(val => {
    const n = Number(val);
    return isNaN(n) || !isFinite(n) ? 0 : n;
  });
};

const Food = {
  async create(food) {
    const hourlyIntake = sanitizeIntake(food.hourlyIntake);
    const total = Number(food.total);
    const validTotal = isNaN(total) || !isFinite(total) ? 0 : total;

    const result = await run(
      'INSERT INTO foods (userId, hourlyIntake, total, date) VALUES (?, ?, ?, ?)',
      [
        food.userId,
        JSON.stringify(hourlyIntake),
        validTotal,
        food.date || new Date().toISOString().split('T')[0],
      ]
    );

    return { id: result.lastID, userId: food.userId, hourlyIntake, total: validTotal, date: food.date|| new Date().toISOString().split('T')[0]};
  },

  async findAll() {
    const rows = await execute('SELECT * FROM foods');
    return rows.map(row => ({
      ...row,
      hourlyIntake: sanitizeIntake(JSON.parse(row.hourlyIntake)),
    }));
  },

  async findById(id) {
    const rows = await execute('SELECT * FROM foods WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return { ...row, hourlyIntake: sanitizeIntake(JSON.parse(row.hourlyIntake)) };
  },

  async update(id, food) {
    const hourlyIntake = sanitizeIntake(food.hourlyIntake);
    const total = Number(food.total);
    const validTotal = isNaN(total) || !isFinite(total) ? 0 : total;

    const result = await run(
      'UPDATE foods SET userId = ?, hourlyIntake = ?, total = ?, date = ? WHERE id = ?',
      [
        food.userId,
        JSON.stringify(hourlyIntake),
        validTotal,
        food.date,
        id,
      ]
    );

    return result.changes > 0 ? { id, ...food, hourlyIntake, total: validTotal } : null;
  },

  async delete(id) {
    const result = await run('DELETE FROM foods WHERE id = ?', [id]);
    return result.changes > 0;
  },

  async findByUserId(userId) {
    const rows = await execute('SELECT * FROM foods WHERE userId = ?', [userId]);
    return rows.map(row => ({
      ...row,
      hourlyIntake: sanitizeIntake(JSON.parse(row.hourlyIntake)),
    }));
  },

  async findByUserIdAndDate(userId, date) {
    const rows = await execute(
      'SELECT * FROM foods WHERE userId = ? AND date = ?',
      [userId, date]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      ...row,
      date:row.date||new Date().toISOString().split('T')[0],
      hourlyIntake: sanitizeIntake(JSON.parse(row.hourlyIntake)),
    };
  },

  async findWeeklyIntake(userId) {
    const rows = await execute(
      `
      SELECT date, SUM(total) as totalCalories
      FROM foods
      WHERE userId = ?
        AND date >= DATE('now', '-6 days')
      GROUP BY date
      ORDER BY date
      `,
      [userId]
    );
    return rows.map(row => ({
      ...row,
      totalCalories: Number(row.totalCalories) || 0
    }));
  },
};

export default Food;
