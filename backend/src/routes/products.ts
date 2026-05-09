import { nanoid } from "nanoid";
import { getAll, getById, add, update, remove } from '../store/productsStore';
import type { Product } from "../store/productsStore";

import express, {
  Request,
  Response,
  NextFunction
} from "express";

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const products = await getAll();
        console.log("hit products route");
        res.json(products);
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

router.post("/", async (req: Request<{}, {}, Omit<Product, "id">>, res: Response, next: NextFunction) => {
    try {
        const product = {
            ...req.body,
            id: nanoid(8)
        }

        await add(product);
    } catch (e) {
        next(e);
    }
});

router.patch("/:id", async (req: Request<{ id: string }, {}, Partial<Omit<Product, "id">>>, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const patch = req.body;

        const updated = await update(id, patch);

        if (!updated) {
            return res.status(404).json({
                message: `Product with id "${id}" not found`
            });
        }

        res.json(updated);

    } catch (e) {
        next(e)
    }
});

router.delete("/:id", async (req: Request<{id: string}, {}, {}>, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const ok = await remove(id);

        if (!ok) { 
            return res.status(404).json({message: `Product with id "${id}" not found`}) 
        };

        res.json({ok: true});
    } catch (e) {
        next(e);
    }
})

export default router;