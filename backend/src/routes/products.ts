import { nanoid } from "nanoid";
import { getAll, getById, add, update, remove } from '../store/productsStore.js';
import type { Product } from "../store/productsStore.js";

import express from "express";
import type {
  Request,
  Response,
  NextFunction
} from "express";

interface ValidationError {
    field: string;
    message: string;
}

function validateProduct(data: any): { valid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    if (!data.title || typeof data.title !== "string" || data.title.trim() === "") {
        errors.push({ field: "title", message: "Title is required and must be a string" });
    }

    if (!data.category || typeof data.category !== "string" || data.category.trim() === "") {
        errors.push({ field: "category", message: "Category is required and must be a string" });
    }

    if (!data.description || typeof data.description !== "string" || data.description.trim() === "") {
        errors.push({ field: "description", message: "Description is required and must be a string" });
    }

    if (typeof data.price !== "number" || isNaN(data.price)) {
        errors.push({ field: "price", message: "Price must be a number" });
    } else if (data.price <= 0) {
        errors.push({ field: "price", message: "Price must be greater than 0" });
    }

    if (typeof data.stock !== "number" || isNaN(data.stock) || !Number.isInteger(data.stock)) {
        errors.push({ field: "stock", message: "Stock must be an integer" });
    } else if (data.stock < 0) {
        errors.push({ field: "stock", message: "Stock cannot be negative" });
    }

    if (typeof data.rating !== "number" || isNaN(data.rating)) {
        errors.push({ field: "rating", message: "Rating must be a number" });
    } else if (data.rating < 0 || data.rating > 5) {
        errors.push({ field: "rating", message: "Rating must be between 0 and 5" });
    }

    if (!data.imageUrl || typeof data.imageUrl !== "string" || data.imageUrl.trim() === "") {
        errors.push({ field: "imageUrl", message: "Image URL is required and must be a string" });
    } else if (!isValidUrl(data.imageUrl)) {
        errors.push({ field: "imageUrl", message: "Image URL must be a valid URL" });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

function isValidUrl(urlString: string): boolean {
    try {
        new URL(urlString);
        return true;
    } catch {
        return false;
    }
}

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

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = validateProduct(req.body);

        if (!validation.valid) {
            return res.status(400).json({
                error: "Validation failed",
                details: validation.errors
            });
        }

        const product: Product = {
            ...req.body,
            id: nanoid(8)
        };

        await add(product);
        res.status(201).json(product);
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