import express, { Express } from 'express';
import indexRoutes from './routes/index';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import investmentsRoutes from './routes/investment';
import { errorHandler } from './middleware/errorHandler';

const app: Express = express();

app.use(express.json());

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/investments', investmentsRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
