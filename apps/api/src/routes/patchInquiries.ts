import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";

const inquirySchema = z.object({
  userName: z.string().optional(),
  userEmail: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(1, "A message is required"),
});

export async function patchInquiriesRoutes(app: FastifyInstance) {
  app.post("/patch/inquiries", async (request, reply) => {
    const parsed = inquirySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(422).send({ message: "Check the form", fieldErrors: parsed.error.issues });
    }

    const inquiry = await prisma.patchInquiry.create({
      data: {
        userName: parsed.data.userName || request.authUser?.name || "Customer",
        userEmail: parsed.data.userEmail || request.authUser?.email || "customer@scheidt-bachmann.de",
        company: parsed.data.company || request.authUser?.company || request.authUser?.partner || "",
        message: parsed.data.message.trim(),
        recipients: [
          "Hafsaoui.Wissal@scheidt-bachmann.de",
          "Aloui.Hadil@scheidt-bachmann.de",
        ],
        status: "submitted",
      },
    });

    request.log.info(
      { id: inquiry.id, recipients: inquiry.recipients },
      "Registered patch management inquiry in DB",
    );

    return reply.code(201).send({
      ok: true,
      inquiry,
      message: "Inquiry recorded in database successfully.",
    });
  });

  app.get("/patch/inquiries", async () => {
    const inquiries = await prisma.patchInquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { inquiries };
  });
}
