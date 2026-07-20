import "dotenv/config";
import bcrypt from "bcrypt";

import { prisma } from "../utils/prisma";

async function createAgent() {
  const email = "agent@supportai.com";
  const password = "Agent123!";

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    console.log("Agent already exists:");
    console.log({
      email: existingUser.email,
      role: existingUser.role,
    });

    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const agent = await prisma.user.create({
    data: {
      name: "Support Agent",
      email,
      password: hashedPassword,
      role: "AGENT",
    },
  });

  console.log("Agent created successfully:");
  console.log({
    id: agent.id,
    name: agent.name,
    email: agent.email,
    role: agent.role,
    password,
  });
}

createAgent()
  .catch((error) => {
    console.error("Unable to create agent:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });