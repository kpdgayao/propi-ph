import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { signToken, setAuthCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    // Find agent by email
    const agent = await prisma.agent.findUnique({
      where: { email: data.email },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if agent is active
    if (!agent.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated. Please contact support." },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(data.password, agent.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create JWT and set cookie
    const token = await signToken({
      agentId: agent.id,
      email: agent.email,
      name: agent.name,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      message: "Login successful",
      agent: {
        id: agent.id,
        email: agent.email,
        name: agent.name,
        phone: agent.phone,
        prcLicense: agent.prcLicense,
        photo: agent.photo,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
