import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";

const ticketSchema = z.object({
  carparkName: z.string().min(1, "Car park name is required"),
  customerAccount: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().pipe(z.email("A valid contact email is required")),
  contactPhone: z.string().optional(),
  cpqOrderNumber: z.string().optional(),
  contractNumber: z.string().optional(),
  numberOfDevices: z.number().int().min(1).default(1),
  entervoVersion: z.string().min(1, "entervo software version is required"),
  operatingSystem: z.string().min(1, "Operating System is required"),
  ipAddress1: z.string().min(1, "Primary IP address is required"),
  ipAddress2: z.string().optional(),
  ipAddress3: z.string().optional(),
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
  app.post("/patch/tickets", async (request, reply) => {
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
  app.get("/patch/tickets", async () => {
    const tickets = await prisma.patchTicket.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { tickets };
  });
}
