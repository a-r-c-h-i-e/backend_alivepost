import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { medicineSearchSchema, medicineCreateSchema } from '../validation/schemas';
import { ZodError } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Search medicines (for autocomplete/debouncing)
router.get('/search', async (req: Request, res: Response) => {
    try {
        const validatedData = medicineSearchSchema.parse({ query: req.query.query });
        const { query } = validatedData;

        const medicines = await prisma.medicine.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { dosage: { contains: query, mode: 'insensitive' } },
                    { type: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: 20,
            orderBy: { name: 'asc' },
        });

        res.json(medicines);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('Medicine search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all medicines
router.get('/', async (req: Request, res: Response) => {
    try {
        const medicines = await prisma.medicine.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(medicines);
    } catch (error) {
        console.error('Get medicines error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new medicine (protected route)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const validatedData = medicineCreateSchema.parse(req.body);
        const { name, dosage, type, manufacturer } = validatedData;

        // Check if medicine with same name and dosage exists
        const existingMedicine = await prisma.medicine.findFirst({
            where: { name, dosage },
        });

        if (existingMedicine) {
            res.status(400).json({ error: 'Medicine with this name and dosage already exists' });
            return;
        }

        const medicine = await prisma.medicine.create({
            data: {
                name,
                dosage,
                type,
                manufacturer,
            },
        });

        res.status(201).json(medicine);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('Create medicine error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
