import { Router } from "express";
import {
  changeWorkspaceMemberRoleController,
  createWorkspaceController,
  getAllWorkspacesUserIsMemberController,
  getWorkspaceAnalyticsController,
  getWorkspaceByIdController,
  getWorkspaceMemberController,
} from "../controllers/workspace.controller";
import { getCurrentUserService } from "../services/user.service";

const workspaceRoutes = Router();

workspaceRoutes.post("/create/new", createWorkspaceController);

workspaceRoutes.put(
  "/change/member/role/:id",
  changeWorkspaceMemberRoleController
);

workspaceRoutes.get("/all", getAllWorkspacesUserIsMemberController);

workspaceRoutes.get("/members/:id", getWorkspaceMemberController);

workspaceRoutes.get("/analytics/:id", getWorkspaceAnalyticsController);

workspaceRoutes.get("/:id", getWorkspaceByIdController);
export default workspaceRoutes;
