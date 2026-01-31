// Script to create or update an admin user
// Run with: npx tsx scripts/create-admin.ts

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "kpdgayao@gmail.com";
  const password = "admin123"; // Change this to your preferred password
  const name = "Kyle Gayao";
  const role = "SUPER_ADMIN";

  console.log(`Creating/updating admin: ${email}`);

  const passwordHash = await hash(password, 12);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {
      passwordHash,
      name,
      role,
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      name,
      role,
      isActive: true,
    },
  });

  console.log("Admin created/updated successfully:");
  console.log({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });
  console.log(`\nYou can now login at /admin/login with:`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
