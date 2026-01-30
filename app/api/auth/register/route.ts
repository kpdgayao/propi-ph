import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { signToken, setAuthCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check if email already exists
    const existingEmail = await prisma.agent.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Check if PRC license already exists
    const existingLicense = await prisma.agent.findUnique({
      where: { prcLicense: data.prcLicense },
    });

    if (existingLicense) {
      return NextResponse.json(
        { error: "PRC license already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create agent
    const agent = await prisma.agent.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        prcLicense: data.prcLicense,
        passwordHash,
        areasServed: [],
        specializations: [],
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        prcLicense: true,
        createdAt: true,
      },
    });

    // Create JWT and set cookie
    const token = await signToken({
      agentId: agent.id,
      email: agent.email,
      name: agent.name,
    });

    await setAuthCookie(token);

    return NextResponse.json(
      {
        message: "Registration successful",
        agent,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
