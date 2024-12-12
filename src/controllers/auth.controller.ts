import { Request, Response } from "express";
import { db } from "../lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const signToken = (id: string) => {
  const secret = process.env.JWT_SECRET as string;

  return jwt.sign({ id }, secret, {
    expiresIn: `${process.env.JWT_EXPIRES_IN}d`,
  });
};

const createSendToken = (
  user: any,
  statusCode: number,
  res: Response,
  message: string
) => {
  const token = signToken(user.id);

  const expiry = Number(process.env.JWT_COOKIE_EXPIRES_IN as string);

  const cookieOptions = {
    expires: new Date(Date.now() + expiry * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "none" as const,
    secure: true,
    path: "/",
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    token,
    message,
    user,
  });
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        message: "All fields are required",
      });
      return;
    }

    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.status(400).json({
        message: "Email already in use",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    createSendToken(user, 201, res, "User created");
  } catch (error) {
    console.log("[SIGN_UP_ERROR]", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "All fields are required",
      });
      return;
    }

    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const correctPassword = await bcrypt.compare(password, user?.password!);

    if (!correctPassword) {
      res.status(400).json({
        message: "invalid credentials",
      });
      return;
    }

    createSendToken(user, 200, res, "user logged in");
  } catch (error) {
    console.log("[LOGIN_ERROR]", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log("[LOGOUT_ERROR]", error);
    res.status(500).json({
      message: "internal server error",
    });
  }
};
