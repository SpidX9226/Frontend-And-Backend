import path from "node:path";
import fs from "fs/promises";
import { error } from "node:console";
import { readFile } from "node:fs";
import { get } from "node:http";

export interface Product {
    id: string;
    title: string;
    category: string;
    description: string;
    price: number;
    stock: number;
    rating: number;
    imageUrl: string
}

// PATHS
const DATA_FILE = path.join(__dirname, "..", "data", "products.json");
const SEED_FILE = path.join(__dirname, "..", "data", "products.seed.json");

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDataFile(): Promise<void> {
    try {
        await fs.access(DATA_FILE);
    } catch {
        const seedRaw = await fs.readFile(SEED_FILE, "utf-8");
        await fs.writeFile(DATA_FILE, seedRaw, "utf-8");
    }
}

async function safeReadFile(): Promise<string> {
    await ensureDataFile();
    return fs.readFile(DATA_FILE, "utf-8");
}

function safeParse<T>(raw: string): T {
    try {
        return JSON.parse(raw) as T;
    } catch {
        throw new Error("Failed to parse JSON data file");
    }
}

/**
 * Сохраняет полный список продуктов в json файл
 * 
 * Все операции записи выполняются последовательно через очередь 'writeQueue',
 * чтобы предотвратить гонки и повреждение данных из-за одновременных запросов на запись.
 * 
 * @param data Полный массив продуктов для сохранения
 * @returns Promise, завершающийся после успешной записи файла
 */
async function writeAll(data: Product[]): Promise<void> {
    const payload = JSON.stringify(data, null, 4);

    writeQueue = writeQueue.then(
        () => fs.writeFile(DATA_FILE, payload, "utf-8")
    );

    return writeQueue;
}

// PUBLIC API

export async function getAll(): Promise<Product[]> {
    const raw = await safeReadFile();
    return safeParse<Product[]>(raw || "[]");
}

export async function getById(id: string): Promise<Product | null> {
    const list = await getAll();
    return list.find((p) => p.id === id) ?? null;
}

export async function add(product: Product): Promise<Product> {
    if (!product.id) {
        throw new Error("product must have an id!");
    }

    const list: Product[] = await getAll();

    if (list.some((p) => p.id === product.id)) {
        throw new Error(`Product with id: ${product.id} already exists`)
    }

    const next: Product[] = [
        ...list,
        product
    ];

    await writeAll(next);

    return product;
}

export async function update(id: string, patch: Partial<Omit<Product, "id">>): Promise<Product | null> {
    const list: Product[] = await getAll();
    const index: number = list.findIndex(p => p.id === id);

    if (index === -1) {
        return null;
    }

    const updated: Product = {
        ...list[index],
        ...patch,
        id: id
    } as Product;

    return updated;
}

export async function remove(id: string): Promise<boolean> {
    const list = await getAll();
    const res = list.filter(p=> p.id !== id);

    if (list.length === res.length) { return false; }
    
    await writeAll(res);
    return true;
}