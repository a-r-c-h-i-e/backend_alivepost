import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create a test doctor
    const passwordHash = await bcrypt.hash('password123', 10);

    const doctor = await prisma.doctor.upsert({
        where: { email: 'doctor@test.com' },
        update: {},
        create: {
            email: 'doctor@test.com',
            passwordHash,
            name: 'Dr. John Smith',
        },
    });
    console.log('✅ Created test doctor:', doctor.email);

    // Create sample medicines
    const medicines = [
        { name: 'Paracetamol', dosage: '500mg', type: 'tablet', manufacturer: 'Generic Pharma' },
        { name: 'Paracetamol', dosage: '650mg', type: 'tablet', manufacturer: 'Generic Pharma' },
        { name: 'Amoxicillin', dosage: '250mg', type: 'capsule', manufacturer: 'MediCorp' },
        { name: 'Amoxicillin', dosage: '500mg', type: 'capsule', manufacturer: 'MediCorp' },
        { name: 'Ibuprofen', dosage: '200mg', type: 'tablet', manufacturer: 'PainRelief Inc' },
        { name: 'Ibuprofen', dosage: '400mg', type: 'tablet', manufacturer: 'PainRelief Inc' },
        { name: 'Omeprazole', dosage: '20mg', type: 'capsule', manufacturer: 'GastroHealth' },
        { name: 'Omeprazole', dosage: '40mg', type: 'capsule', manufacturer: 'GastroHealth' },
        { name: 'Metformin', dosage: '500mg', type: 'tablet', manufacturer: 'DiabeCare' },
        { name: 'Metformin', dosage: '850mg', type: 'tablet', manufacturer: 'DiabeCare' },
        { name: 'Atorvastatin', dosage: '10mg', type: 'tablet', manufacturer: 'CardioPharm' },
        { name: 'Atorvastatin', dosage: '20mg', type: 'tablet', manufacturer: 'CardioPharm' },
        { name: 'Amlodipine', dosage: '5mg', type: 'tablet', manufacturer: 'HeartCare' },
        { name: 'Amlodipine', dosage: '10mg', type: 'tablet', manufacturer: 'HeartCare' },
        { name: 'Cough Syrup', dosage: '100ml', type: 'syrup', manufacturer: 'ColdCure' },
        { name: 'Vitamin D3', dosage: '1000IU', type: 'capsule', manufacturer: 'VitaHealth' },
        { name: 'Vitamin C', dosage: '500mg', type: 'tablet', manufacturer: 'VitaHealth' },
        { name: 'B-Complex', dosage: '100mg', type: 'tablet', manufacturer: 'VitaHealth' },
        { name: 'Insulin', dosage: '100IU/ml', type: 'injection', manufacturer: 'DiabeCare' },
        { name: 'Cetirizine', dosage: '10mg', type: 'tablet', manufacturer: 'AllergyCare' },
    ];

    for (const medicine of medicines) {
        await prisma.medicine.upsert({
            where: {
                name_dosage: { name: medicine.name, dosage: medicine.dosage }
            },
            update: {},
            create: medicine,
        });
    }
    console.log(`✅ Created ${medicines.length} sample medicines`);

    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
