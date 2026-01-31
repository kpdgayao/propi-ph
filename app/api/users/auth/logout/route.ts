import { NextResponse } from "next/server";
import { clearUserAuthCookie } from "@/lib/auth";

export async function POST() {
  await clearUserAuthCookie();
  return NextResponse.json({ message: "Logged out successfully" });
}
