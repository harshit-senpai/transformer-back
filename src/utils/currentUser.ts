import jwt from "jsonwebtoken";
import { Request } from "express";
import { db } from "../lib/db";

export async function getCurrentUser(req: Request) {
  try {
    console.log("Full request cookies:", req);
    const token =
      req.headers.authorization?.replace("Bearer ", "") ||
      req?.cookies?.jwt ||
      "";

    console.log("JWT Token ", token);

    if (!token) {
      return null;
    }

    const decoded = (await jwt.verify(
      token,
      process.env.JWT_SECRET as string
    )) as { id: string };

    const currentUser = await db.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    return currentUser;
  } catch (error) {
    console.log("[GET_CURRENT_USER]", error);
    return null;
  }
}
