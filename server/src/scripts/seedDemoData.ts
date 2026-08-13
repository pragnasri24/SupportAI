import "dotenv/config";
import bcrypt from "bcrypt";

import {
  TicketPriority,
  TicketStatus,
} from "../generated/prisma/client";

import { prisma } from "../utils/prisma";

async function seedDemoData() {
  const customerEmail = "demo.customer@supportai.com";
  const customerPassword = "Customer123!";

  const agentEmail = "agent@supportai.com";
  const agentPassword = "Agent123!";

  console.log("Cleaning old demo data...");

  await prisma.comment.deleteMany({});
  await prisma.ticket.deleteMany({});

  console.log("Preparing customer account...");

  const customerHashedPassword = await bcrypt.hash(
    customerPassword,
    10
  );

  const customer = await prisma.user.upsert({
    where: {
      email: customerEmail,
    },
    update: {
      name: "Demo Customer",
      password: customerHashedPassword,
      role: "CUSTOMER",
    },
    create: {
      name: "Demo Customer",
      email: customerEmail,
      password: customerHashedPassword,
      role: "CUSTOMER",
    },
  });

  console.log("Preparing support agent...");

  const agentHashedPassword = await bcrypt.hash(
    agentPassword,
    10
  );

  const agent = await prisma.user.upsert({
    where: {
      email: agentEmail,
    },
    update: {
      name: "Support Agent",
      password: agentHashedPassword,
      role: "AGENT",
    },
    create: {
      name: "Support Agent",
      email: agentEmail,
      password: agentHashedPassword,
      role: "AGENT",
    },
  });

  console.log("Creating demo tickets...");

  const passwordTicket = await prisma.ticket.create({
    data: {
      title: "Unable to reset password",
      description:
        "I requested a password reset link, but the email has not arrived after several attempts.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      userId: customer.id,
    },
  });

  const billingTicket = await prisma.ticket.create({
    data: {
      title: "Billing charge looks incorrect",
      description:
        "My latest invoice includes an additional charge that I do not recognize. Please review the billing details.",
      status: TicketStatus.PENDING,
      priority: TicketPriority.HIGH,
      userId: customer.id,
      assignedAgentId: agent.id,
    },
  });

  const profileTicket = await prisma.ticket.create({
    data: {
      title: "Update profile information",
      description:
        "I need to update the phone number and company information associated with my account.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      userId: customer.id,
      assignedAgentId: agent.id,
    },
  });

  const notificationTicket = await prisma.ticket.create({
    data: {
      title: "Email notifications not arriving",
      description:
        "Support ticket updates are visible in the dashboard, but I am not receiving email notifications.",
      status: TicketStatus.CLOSED,
      priority: TicketPriority.MEDIUM,
      userId: customer.id,
      assignedAgentId: agent.id,
    },
  });

  const featureTicket = await prisma.ticket.create({
    data: {
      title: "Request for dark mode",
      description:
        "It would be helpful to have a dark mode option for the support dashboard.",
      status: TicketStatus.CLOSED,
      priority: TicketPriority.LOW,
      userId: customer.id,
    },
  });

  console.log("Creating demo conversation...");

  await prisma.comment.createMany({
    data: [
      {
        ticketId: billingTicket.id,
        userId: customer.id,
        message:
          "The extra charge appeared on my most recent invoice. I can provide the invoice number if needed.",
      },
      {
        ticketId: billingTicket.id,
        userId: agent.id,
        message:
          "Thanks for the details. I am reviewing the billing record and will update you once the charge has been verified.",
      },
      {
        ticketId: notificationTicket.id,
        userId: customer.id,
        message:
          "I checked my spam folder as well, but the notifications are still missing.",
      },
      {
        ticketId: notificationTicket.id,
        userId: agent.id,
        message:
          "We updated your notification settings. Please confirm whether new ticket updates are now arriving.",
      },
      {
        ticketId: notificationTicket.id,
        userId: customer.id,
        message:
          "Yes, notifications are working now. Thank you.",
      },
    ],
  });

  console.log("");
  console.log("Demo data created successfully.");
  console.log("");

  console.log("Customer login:");
  console.log({
    email: customerEmail,
    password: customerPassword,
  });

  console.log("");

  console.log("Agent login:");
  console.log({
    email: agentEmail,
    password: agentPassword,
  });

  console.log("");

  console.log("Tickets created:");
  console.log({
    passwordTicket: passwordTicket.title,
    billingTicket: billingTicket.title,
    profileTicket: profileTicket.title,
    notificationTicket: notificationTicket.title,
    featureTicket: featureTicket.title,
  });
}

seedDemoData()
  .catch((error) => {
    console.error("Unable to seed demo data:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });