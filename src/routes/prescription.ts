import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { prescriptionCreateSchema, PrescriptionCreateInput } from '../validation/schemas';
import { ZodError } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Create a prescription

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const validatedData = prescriptionCreateSchema.parse(req.body);
        const { 
            patientId, 
            patientName, 
            patientMobileNumber,
            patientProblem,
            medicineId, 
            timings, 
            notes 
        } = validatedData as PrescriptionCreateInput;

        // Find or create patient
        let patient = await prisma.patient.findUnique({
            where: { patientId },
        });

        if (!patient) {
            patient = await prisma.patient.create({
                data: {
                    patientId,
                    name: patientName,
                    mobileNumber: patientMobileNumber,
                    problem: patientProblem,
                },
            });
        }

        // Verify medicine exists
        const medicine = await prisma.medicine.findUnique({
            where: { id: medicineId },
        });

        if (!medicine) {
            res.status(404).json({ error: 'Medicine not found' });
            return;
        }

        // Create prescription with timings
        const prescription = await prisma.prescription.create({
            data: {
                doctorId: req.doctorId!,
                patientId: patient.id,
                medicineId,
                notes,
                timings: {
                    create: timings.map((timing) => ({
                        timingType: timing.timingType,
                        customTime: timing.customTime || null,
                    })),
                },
            },
            include: {
                patient: true,
                medicine: true,
                timings: true,
            },
        });

        res.status(201).json(prescription);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
            return;
        }
        console.error('Create prescription error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get all prescriptions for the logged-in doctor
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const prescriptions = await prisma.prescription.findMany({
            where: { doctorId: req.doctorId },
            include: {
                patient: true,
                medicine: true,
                timings: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(prescriptions);
    } catch (error) {
        console.error('Get prescriptions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a specific prescription
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const prescription = await prisma.prescription.findFirst({
            where: { id, doctorId: req.doctorId },
            include: {
                patient: true,
                medicine: true,
                timings: true,
            },
        });

        if (!prescription) {
            res.status(404).json({ error: 'Prescription not found' });
            return;
        }

        res.json(prescription);
    } catch (error) {
        console.error('Get prescription error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a prescription
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const prescription = await prisma.prescription.findFirst({
            where: { id, doctorId: req.doctorId },
        });

        if (!prescription) {
            res.status(404).json({ error: 'Prescription not found' });
            return;
        }

        await prisma.prescription.delete({
            where: { id },
        });

        res.json({ message: 'Prescription deleted successfully' });
    } catch (error) {
        console.error('Delete prescription error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get("/patient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const prescriptions = await prisma.prescription.findMany({
      where: {
        patientId: id
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            patientId: true
          }
        },
        medicine: {
          select: {
            id: true,
            name: true,
            dosage: true,
            type: true,
            manufacturer: true
          }
        },
        timings: {
          select: {
            id: true,
            timingType: true,
            customTime: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(prescriptions);
  } catch (error) {
    console.error('Patient Prescription Error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
export default router;
