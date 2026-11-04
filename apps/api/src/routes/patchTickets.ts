import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";
import { requirePermission } from "../rbac/guard.js";

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const ticketSchema = z.object({
  carparkName: z.string().trim().min(1, "Car park name is required"),
  customerAccount: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().trim().pipe(z.email("A valid contact email is required")),
  contactPhone: z.string().optional(),
  cpqOrderNumber: z.string().trim().min(1, "CPQ Order Number is mandatory"),
  contractNumber: z.string().trim().min(1, "Contract Number is mandatory").regex(/^\d+$/, "Contract Number must contain only digits"),
  numberOfDevices: z.coerce.number().int("Number of devices must be an integer").min(1, "At least 1 device is required"),
  entervoVersion: z.string().trim().min(1, "entervo Software Release is mandatory"),
  operatingSystem: z.string().trim().min(1, "Operating System is required"),
  ipAddress1: z.string().trim().regex(IPV4_REGEX, "Primary IP address must be a valid IPv4 address (e.g. 10.50.38.100)"),
  ipAddress2: z.string().trim().refine((val) => !val || IPV4_REGEX.test(val), "Secondary IP address must be a valid IPv4 address").optional(),
  ipAddress3: z.string().trim().refine((val) => !val || IPV4_REGEX.test(val), "IP address 3 must be a valid IPv4 address").optional(),
  remoteAccess: z.string().optional(),
  priority: z.string().default("3 - Moderate"),
  urgency: z.string().default("2 - Medium"),
  category: z.string().default("Service Request"),
  subCategory: z.string().default("entervo.it.security"),
  notes: z.string().optional(),
});

function generateTicketNumber(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `CS${rand}`;
}

export async function patchTicketsRoutes(app: FastifyInstance) {
  // Create patch request ticket
  app.post("/patch/tickets", { preHandler: requirePermission("patch:read") }, async (request, reply) => {
    const parsed = ticketSchema.safeParse(request.body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return reply.code(422).send({ message: "Please check the form inputs", fieldErrors });
    }

    let ticketNum = generateTicketNumber();
    while (await prisma.patchTicket.findUnique({ where: { ticketNumber: ticketNum } })) {
      ticketNum = generateTicketNumber();
    }

    const ticket = await prisma.patchTicket.create({
      data: {
        ticketNumber: ticketNum,
        carparkName: parsed.data.carparkName,
        customerAccount: parsed.data.customerAccount || request.authUser?.company || request.authUser?.partner || "",
        contactName: parsed.data.contactName || request.authUser?.name || "Customer Contact",
        contactEmail: parsed.data.contactEmail,
        contactPhone: parsed.data.contactPhone || "",
        cpqOrderNumber: parsed.data.cpqOrderNumber || "",
        contractNumber: parsed.data.contractNumber || "",
        numberOfDevices: parsed.data.numberOfDevices,
        entervoVersion: parsed.data.entervoVersion,
        operatingSystem: parsed.data.operatingSystem,
        ipAddress1: parsed.data.ipAddress1,
        ipAddress2: parsed.data.ipAddress2 || "",
        ipAddress3: parsed.data.ipAddress3 || "",
        remoteAccess: parsed.data.remoteAccess || "",
        priority: parsed.data.priority,
        urgency: parsed.data.urgency,
        category: parsed.data.category,
        subCategory: parsed.data.subCategory,
        status: "Open",
        notes: parsed.data.notes || "",
      },
    });

    request.log.info({ ticketId: ticket.id, ticketNumber: ticket.ticketNumber }, "New Patch Ticket Created");

    return reply.code(201).send({
      ok: true,
      ticket,
      message: `Patch request ticket ${ticket.ticketNumber} created successfully.`,
    });
  });

  // List recent patch tickets
  app.get("/patch/tickets", { preHandler: requirePermission("patch:read") }, async () => {
    const tickets = await prisma.patchTicket.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { tickets };
  });
}
