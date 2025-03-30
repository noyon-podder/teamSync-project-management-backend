import { PermissionType } from "../enums/role.enum";
import { UnauthorizedException } from "./appError";
import { RolePermissions } from "./role-permission";

export const roleGuard = (
  role: keyof typeof RolePermissions,
  requiredPermissions: PermissionType[]
) => {
  const permissions = RolePermissions[role];

  console.log(
    "Permissions check form Role Guard:",
    permissions,
    "Required Permissions: ",
    requiredPermissions
  );

  const hasPermissions = requiredPermissions.every((permission) =>
    permissions.includes(permission)
  );

  if (!hasPermissions) {
    throw new UnauthorizedException(
      "You do not have the necessary permissions to perform this action"
    );
  }
};
