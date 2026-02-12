import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { loginSchema, registerSchema } from '../validation/schemas';
import { ZodError } from 'zod';
import {RegisterInput} from '../validation/schemas'
const router = Router();
const prisma = new PrismaClient();

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

        const doctor = await prisma.doctor.findUnique({
            where: { email },
        });

        if (!doctor) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, doctor.passwordHash);

        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const secret = process.env.JWT_SECRET || 'fallback-secret';
        const token = jwt.sign({ doctorId: doctor.id }, secret, { expiresIn: '24h' });

    res.cookie('token', token , {
  httpOnly: true, // Prevents JavaScript access
  secure: true,   // Ensures HTTPS
  sameSite: 'strict' // Protects against CSRF
});
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register endpoint (for creating test accounts)
router.post('/register', async (req: Request, res: Response) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const existingDoctor = await prisma.doctor.findUnique({
            where: { email: validatedData.email },
        });

        if (existingDoctor) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }

        const passwordHash = await bcrypt.hash(validatedData.password, 10);

        const doctor = await prisma.doctor.create({
            data: {
                email: validatedData.email,
                passwordHash,
                name: validatedData.name,
                type: validatedData.type,
                mobileNumber: validatedData.mobileNumber
            },
        });

        const secret = process.env.JWT_SECRET || 'fallback-secret';
        const token = jwt.sign({ doctorId: doctor.id }, secret, { expiresIn: '24h' });

        res.status(201).json({
            token,
            doctor: {
                id: doctor.id,
                email: doctor.email,
                name: doctor.name,
            },
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
