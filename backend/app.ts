import express from "express";
import cors from "cors";
import productsRouter from './routes/products'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
    cors({
        origin: "http://localhost:3001"
    })
);

app.use(express.json);

app.get('/', (req, res) => {
    res.send("Express API is running. Try  /api/products");
});

app.use("/api/products", productsRouter);

console.log(typeof(express))