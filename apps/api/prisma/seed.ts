import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/auth/password.js";

/**
 * Seeds the accounts the hub demoed with, one per role so RBAC can actually be
 * seen working. The password comes from SEED_PASSWORD and is only ever meant
 * for local and demo databases.
 */
const prisma = new PrismaClient();

const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "ChangeMe123!dev";

const users = [
  { email: "k.harperscheidt@scheidt-bachmann.de", name: "Kai Harperscheidt", initials: "KH", partner: "S&B HQ", color: "#1A6FD4", roles: ["Admin"] },
  { email: "m.delvaux@scheidt-bachmann.de", name: "Marc Delvaux", initials: "MD", partner: "S&B UK", color: "#1AB870", roles: ["Project Manager"] },
  { email: "a.krueger@scheidt-bachmann.de", name: "Anna Krüger", initials: "AK", partner: "S&B HQ", color: "#C0185A", roles: ["Sales"] },
  { email: "l.meissner@scheidt-bachmann.de", name: "Laura Meissner", initials: "LM", partner: "S&B CH", color: "#6B4FBB", roles: ["Reviewer"] },
  { email: "devops@scheidt-bachmann.de", name: "DevOps Bot", initials: "DB", partner: "S&B HQ", color: "#0E7490", roles: ["DevOps"] },
  { email: "j.vandijk@scheidt-bachmann.de", name: "Joost van Dijk", initials: "JV", partner: "S&B NL", color: "#B07800", roles: ["Partner"] },
  { email: "medwayft.carparking@nhs.net", name: "Medway IT", initials: "MI", partner: "Medway Hospital", color: "#F4A136", roles: ["Customer"] },
];

async function main() {
  const passwordHash = await hashPassword(SEED_PASSWORD);

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, initials: user.initials, partner: user.partner, color: user.color, roles: user.roles },
      create: { ...user, status: "active", issuer: "local", passwordHash },
    });
  }

  console.log(`Seeded ${users.length} users. Password: ${SEED_PASSWORD}`);
}

main()
  .catch((error) => { console.error(error); process.exit(1); })
  .finally(() => void prisma.$disconnect());
