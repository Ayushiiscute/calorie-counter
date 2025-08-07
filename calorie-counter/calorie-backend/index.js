import express, { json } from 'express';
import cors from 'cors';

import userRoutes from './routes/user.js';
import foodRoutes from './routes/food.js';
import authRoutes from './routes/auth.js';

const app = express();

app.use(cors());
app.use(json());


app.use('/auth', authRoutes);       
app.use('/users', userRoutes);      
app.use('/food', foodRoutes);        


app.get('/', (req, res) => {
  res.send('Hello! Server is running.');
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://192.168.8.228:${PORT}`);
});
