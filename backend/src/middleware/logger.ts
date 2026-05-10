import type {
  Request,
  Response,
  NextFunction
} from "express";

export default function logger(req: Request, res: Response, next: NextFunction): void {
    const start: number = Date.now()
    res.on('finish', () => {
        const duration = Date.now() - start; 
        console.log(`[${new Date().toISOString()}] (${req.method}): ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    
    next();
}