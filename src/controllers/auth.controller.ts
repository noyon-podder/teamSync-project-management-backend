import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { config } from "../config/app.config";
import { loginSchema, registerSchema } from "../validations/auth.validation";
import { HTTPSTATUS } from "../config/http.config";
import { registerUserService } from "../services/auth.service";
import passport from "passport";
import { signJwtToken } from "../utils/jwt";

export const googleLoginCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const jwt = req.jwt;
    const currentWorkspace = req.user?.currentWorkspace;

    if (!jwt) {
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
      );
    }

    // return res.redirect(
    //   `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`
    // );

    return res.redirect(
      `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=success&access_token=${jwt}&current_workspace=${currentWorkspace}`
    );
  }
);

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse({ ...req.body });

    await registerUserService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User created successfully",
    });
  }
);

export const loginUserController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (
        error: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined
      ) => {
        if (error) {
          return next(error);
        }

        if (!user) {
          return res.status(HTTPSTATUS.UNAUTHORIZED).json({
            message: info?.message || "Invalid email or password",
          });
        }

        // req.logIn(user, (err) => {
        //   if (err) {
        //     return next(err);
        //   }

        //   return res.status(HTTPSTATUS.OK).json({
        //     message: "Login Successfully",
        //     user,
        //   });
        // });

        const access_token = signJwtToken({ userId: user._id });

        return res.status(HTTPSTATUS.OK).json({
          message: "Logged in successfully",
          user,
          access_token,
        });
      }
    )(req, res, next);
  }
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error", err);
        return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
          error: "Failed to log out",
        });
      }
    });

    req.session = null;

    return res.status(HTTPSTATUS.OK).json({
      message: "Logged out successfully",
    });
  }
);
