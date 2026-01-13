import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = "admin@landzy.com";
  const password = "admin12345";

  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role: "admin",
      },
    });
    console.log("✅ Admin creado:", email, password);
  } else {
    console.log("ℹ️ Admin ya existe:", email);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
