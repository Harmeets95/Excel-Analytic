import express from "express"
import cors from "cors"
import "dotenv/config"
import connectDB from "./config/db.js"
import userRouter from "./routes/userRoutes.js"
import excelRouter from "./routes/excelRoutes.js"
import chartRouter from "./routes/chartRoutes.js"


const app = express()

const port = process.env.PORT || 4000

await connectDB()

app.use(express.json())
app.use(cors())



app.get("/",(req,res)=>{
    res.send("API WORKING")
})
app.use("/api/users",userRouter)
app.use("/api/excel",excelRouter)
app.use("/api/chart",chartRouter)



app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})
