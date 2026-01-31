import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { signAdminToken, setAdminAuthCookie, AdminRole } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = adminLoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await compare(password, admin.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Create and set auth token
    const token = await signAdminToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role as AdminRole,
    });
    await setAdminAuthCookie(token);

    return NextResponse.json({
      message: "Login successful",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
