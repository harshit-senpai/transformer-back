import { NextFunction, Request, Response } from "express";
import { getCurrentUser } from "../utils/currentUser";

export async function requireUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await getCurrentUser(req);

    console.log(user);

    if (!user) {
      res.status(401).json({
        message: "Unauthorized - Please login",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }
}
