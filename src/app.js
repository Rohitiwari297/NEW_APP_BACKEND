import express from 'express'
import connectDB from './config/database.js';
import morgan from 'morgan';
import authRoute from './modules/auth/auth.router.js'
import userRoute from './modules/user/user.router.js'
import articleRoute from './modules/article/article.router.js'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import categoryRoute from './modules/category/category.router.js';


const app = express();
connectDB()

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}))

// routes (example)
app.get('/', (req, res) => {
    res.send('Server running... ')
})

app.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Api is working'
    })
})


app.use('/api/v1/auth', authRoute)
app.use('/api/v1/users', userRoute);
app.use('/api/v1/category', categoryRoute);
app.use('/api/v1/articles', articleRoute);






export default app;

