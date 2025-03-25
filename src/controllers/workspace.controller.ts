import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { createWorkspaceSchema } from "../validations/workspace.validation";
import { HTTPSTATUS } from "../config/http.config";
import {
  createWorkspaceService,
  getAllWorkspaceUserIsMemberService,
} from "../services/workspace.service";

export const createWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createWorkspaceSchema.parse(req.body);

    const userId = req.user?._id;

    const { workspace } = await createWorkspaceService(userId, body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Workspace create successfully",
      workspace,
    });
  }
);

export const getAllWorkspacesUserIsMemberController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { workspaces } = await getAllWorkspaceUserIsMemberService(userId);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User workspace fetch successfully",
      workspaces,
    });
  }
);
