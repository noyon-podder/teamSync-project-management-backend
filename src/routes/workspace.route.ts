import { Router } from "express";
import {
  createWorkspaceController,
  getAllWorkspacesUserIsMemberController,
} from "../controllers/workspace.controller";
import { getCurrentUserService } from "../services/user.service";

const workspaceRoutes = Router();

workspaceRoutes.post("/create/new", createWorkspaceController);
workspaceRoutes.get("/all", getAllWorkspacesUserIsMemberController);

export default workspaceRoutes;
