import express from "express";
import { nanoid } from "nanoid";
import {getAll, getById} from '../store/productsStore';

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const products = await getAll();
    } catch(e) {
        next(e);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const id: string = req.params.id;
        const product = await getById(id);

        if (!product) {
            res.status(402).json({
                message: `Product with id "${id}" not found`
            });
        }

        res.json(product);
    } catch (e) {
        next(e);
    }
});

export default router;