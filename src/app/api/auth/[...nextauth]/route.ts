import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

const handler = NextAuth(authOptions);

export async function GET(req: NextRequest, props: { params: Promise<{ nextauth: string[] }> }) {
  const params = await props.params;
  return handler(req, { params });
}

export async function POST(req: NextRequest, props: { params: Promise<{ nextauth: string[] }> }) {
  const params = await props.params;
  return handler(req, { params });
}

