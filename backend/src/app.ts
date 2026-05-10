import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import productsRouter from './routes/products.js';
import logger from './middleware/logger.js';
import SwaggerUi from 'swagger-ui-express';
import { parse } from 'yaml';
import { readFileSync } from "node:fs";
import path from "node:path";

const app = express();
const PORT = process.env.PORT || 3000;

const yamlFile = readFileSync(
    path.join(process.cwd(), "src", "docs", "api-docs.yaml"),
    "utf-8"
);
const swaggerSpec = parse(yamlFile);

app.use(
    cors({
        origin: "http://localhost:3001"
    })
);

app.use(express.json());
app.use(logger);

app.use("/api-docs", SwaggerUi.serve, SwaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
    res.send("Express API is running. Try  /api/products");
});

app.use("/api/products", productsRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            error: "Invalid JSON in request body",
            datails: [{
                message: "Try with valid json"
            }]
        })
    }
    next(err);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err);

    res.status(500).json({
        error: "Internal Server Error"
    });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not found"
  });
});

app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});