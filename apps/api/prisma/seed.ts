import { PrismaClient } from "@prisma/client";
import { VALIDATION_RULES } from "@service-hub/shared";
import { hashPassword } from "../src/auth/password.js";
import {
  AUDIT_LOG, DEFAULT_PLATFORM_CONFIG, DEMO_ONBOARDING_DRAFT, INITIAL_NOTIFS,
  INITIAL_TEMPLATES, PROJECTS,
} from "../src/data/seed-data.js";

/**
 * Seeds the accounts the hub demoed with, one per role so RBAC can actually be
 * seen working. The password comes from SEED_PASSWORD and is only ever meant
 * for local and demo databases.
 */
const prisma = new PrismaClient();

const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "ChangeMe123!dev";

const users = [
  { email: "aouichi.sarra@scheidt-bachmann.de", name: "Sarra Aouichi", initials: "SA", partner: "S&B HQ", color: "#00A3E0", roles: ["Admin"] },
  { email: "admin@scheidt-bachmann.de", name: "Kai Harperscheidt", initials: "KH", partner: "S&B HQ", color: "#1A6FD4", roles: ["Admin"] },
  { email: "manager@scheidt-bachmann.de", name: "Manager Test", initials: "MT", partner: "S&B UK", color: "#1AB870", roles: ["Project Manager"] },
  { email: "sales@scheidt-bachmann.de", name: "Sales Test", initials: "ST", partner: "S&B HQ", color: "#C0185A", roles: ["Sales"] },
  { email: "reviewer@scheidt-bachmann.de", name: "Reviewer Test", initials: "RT", partner: "S&B CH", color: "#6B4FBB", roles: ["Reviewer"] },
  { email: "devops@scheidt-bachmann.de", name: "DevOps Bot", initials: "DB", partner: "S&B HQ", color: "#0E7490", roles: ["DevOps"] },
  { email: "partner@scheidt-bachmann.de", name: "Joost van Dijk", initials: "JV", partner: "S&B NL", color: "#B07800", roles: ["Partner"] },
  { email: "customer@scheidt-bachmann.de", name: "Medway IT", initials: "MI", partner: "Medway Hospital", color: "#F4A136", roles: ["Customer"] },
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

  // Each seeded account gets the demo draft as its saved draft, so the wizard
  // opens on something to work with rather than a blank form.
  for (const seeded of users) {
    const row = await prisma.user.findUnique({ where: { email: seeded.email } });
    if (!row) continue;
    await prisma.onboardingDraft.upsert({
      where: { userId: row.id },
      update: {},
      create: { userId: row.id, data: DEMO_ONBOARDING_DRAFT },
    });
  }

  for (const project of PROJECTS) {
    await prisma.project.upsert({ where: { id: project.id }, update: {}, create: project });
  }
  for (const template of INITIAL_TEMPLATES) {
    await prisma.template.upsert({ where: { id: template.id }, update: {}, create: template });
  }
  for (const notif of INITIAL_NOTIFS) {
    await prisma.notification.upsert({ where: { id: notif.id }, update: {}, create: notif });
  }

  // Rules come from the shared registry, so the table can never list something
  // the wizard doesn't enforce. Only `active` and `severity` are editable
  // afterwards, and an existing row's are left alone.
  for (const rule of VALIDATION_RULES) {
    const { id, field, category, type, pattern, severity, active, description } = rule;
    await prisma.rule.upsert({
      where: { id },
      update: { field, category, type, pattern, description },
      create: { id, field, category, type, pattern, severity, active, description },
    });
  }

  // Seeding with explicit ids leaves the identity sequence at 1, so the next
  // insert that lets Postgres choose an id collides with a seeded row. Nudge
  // each sequence past the highest id actually present.
  for (const table of ["Project", "Template", "Notification"]) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, false)`,
    );
  }

  await prisma.platformSetting.upsert({
    where: { id: "platform" },
    update: {},
    create: { id: "platform", ...DEFAULT_PLATFORM_CONFIG },
  });

  console.log(
    `Seeded ${users.length} users, ${PROJECTS.length} projects, ${INITIAL_TEMPLATES.length} templates, ` +
    `${VALIDATION_RULES.length} rules, ${INITIAL_NOTIFS.length} notifications, ${AUDIT_LOG.length} audit entries.`,
  );
  console.log(`Password: ${SEED_PASSWORD}`);
}

main()
  .catch((error) => { console.error(error); process.exit(1); })
  .finally(() => void prisma.$disconnect());
