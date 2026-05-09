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

/**
 * Очередь для записи в файл.
 * 
 * Работает на основе Promise.then().then();
 * Promise.resolve() используется потому, что then() можно использовать только у
 * уже существующего Promis'a
 * 
 * Используется для того чтобы избежать одновременных записей в файл
 * которые могут стереть предыдущие изменения прошлые.
 * 
 */
// ! operationQueue -- это промис, представляющий завершение всех операций, добавленных в конец очереди
// 1. ждёт старый хвост
// 2. добавляет себя в конец
// 3. становится новым хвостом
let operationQueue: Promise<void> = Promise.resolve();

/**
 * Выполняет ассинхронные операции по порядку
 * 
 * Предотвращает гонки вовремя read-write-modify операций
 * 
 * @param operation Операция которая должна встать в конец очереди
 * @returns Результат операции
 */
async function withLock<T>(operation: () => Promise<T>): Promise<T> {
    // Создаёт новый промис с концом в виде operation
    const res: Promise<T> = operationQueue.then(operation);

    // ? Почему не operationQueue = res?
    // ! Потому что res имеет тип Promise<T>, а нам нужен Promise<void>
    // ! .then(() => undefined) возвращает как раз таки Promise<void>
    // ! resolved (void) -> operation A -> void -> operation B -> void
    // ! .catch нужен чтобы вся очередь не упала при ошибке в одной из операций
    operationQueue = res
        .then(() => undefined)
        .catch(() => undefined);
    
    // Возвращается именно res чтобы вызвающая функция получила результат именно этой операции
    return res;
}

async function ensureDataFile(): Promise<void> {
    try {
        await fs.access(DATA_FILE);
    } catch {
        const seedRaw = await fs.readFile(SEED_FILE, "utf-8");
        await fs.writeFile(DATA_FILE, seedRaw, "utf-8");
    }
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

    await fs.writeFile(DATA_FILE, payload, 'utf-8');
}

async function readAll(): Promise<Product[]> {
    await ensureDataFile();

    const raw = await fs.readFile(DATA_FILE, 'utf-8');

    return JSON.parse(raw || "[]") as Product[]
}

// PUBLIC API

// ! Все оперции здесь работают с operationQueue и withLock
// ! для избежания потери или неправильных данных

/**
 * Безопасная версия readAll()
 * 
 * работает с использованием operationQueue для достижения
 * правильной последовательности операций и избежания перетерания данных
 * 
 * @returns Возвращает все эллементы списком продуктов
 */
export async function getAll(): Promise<Product[]> {
    return withLock(async () => {
        return await readAll()
    });
}

export async function getById(id: string): Promise<Product | null> {
    return withLock(async () => {
        const list = await readAll();

        return list.find((p) => p.id === id) ?? null;
    });
}

export async function add(product: Product): Promise<Product> {
    return withLock(async () => {
        const list = await readAll();

        const exists = list.some(
            p => p.id === product.id
        );

        if (exists) {
            throw new Error(`Product with id "${product.id}" already exists`);
        }

        list.push(product);

        await writeAll(list);
        return product;
    })
}

export async function update(id: string, patch: Partial<Omit<Product, "id">>): Promise<Product> {
    return withLock(async () => {
        const list = await readAll();
        const index = list.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error(`There is no product with id: ${id}`);
        }

        const res: Product = {
            ...list[index],
            ...patch,
            id: id
        } as Product;

        list[index] = res;
        await writeAll(list);

        return res;
    })
}

export async function remove(id: string): Promise<boolean> {
    return withLock(async () => {
        const list = await readAll();
        const res = list.filter(p => p.id !== id);

        if (list.length === res.length) {
            return false;
        }

        await writeAll(res);
        return true;
    })
}