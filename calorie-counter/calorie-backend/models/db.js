import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbPromise = open({
  filename: './myappdb.sqlite', 
  driver: sqlite3.Database
});

export const execute = async (query, params = []) => {
  const db = await dbPromise;
  return db.all(query, params);
};

export const run = async (query, params = []) => {
  const db = await dbPromise;
  return db.run(query, params);
};

export default dbPromise;
