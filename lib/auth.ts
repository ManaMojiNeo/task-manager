import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET as string;
const TOKEN_EXPIRES_IN = "7d";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/** เข้ารหัสรหัสผ่านด้วย bcrypt ก่อนบันทึกลงฐานข้อมูล ห้ามเก็บรหัสผ่านจริงเด็ดขาด */
export async function hashPassword(plainPassword: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(plainPassword, saltRounds);
}

/** เทียบรหัสผ่านที่ผู้ใช้กรอกกับ hash ที่เก็บไว้ในฐานข้อมูล */
export async function verifyPassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

/** ออก JWT token หลังเข้าสู่ระบบสำเร็จ ใช้แนบไปกับ Authorization header ของทุกคำขอถัดไป */
export function signToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

/**
 * Middleware-style helper: ตรวจสอบ Authorization: Bearer <token> จาก request
 * คืนค่า AuthUser ถ้า token ถูกต้อง หรือ null ถ้าไม่มี/หมดอายุ/ปลอม
 */
export async function verifyAuth(req: NextRequest): Promise<AuthUser | null> {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}
