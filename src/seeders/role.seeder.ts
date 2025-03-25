import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/db.config";
import RoleModel from "../models/role-permission.model";
import { RolePermissions } from "../utils/role-permission";

const seedRoles = async () => {
  console.log("Seeding roles started....");

  try {
    await connectDatabase();

    const session = await mongoose.startSession();
    session.startTransaction();

    console.log("Clearing existing roles...");
    await RoleModel.deleteMany({}, { session });

    for (const roleName in RolePermissions) {
      const role = roleName as keyof typeof RolePermissions;
      const permissions = RolePermissions[role];

      // check if role existing
      const existingRole = await RoleModel.findOne({ name: role }).session(
        session
      );

      if (!existingRole) {
        const newRole = new RoleModel({
          name: role,
          permissions: permissions,
        });
        await newRole.save({ session });
        console.log(`Role ${role} added with permissions`);
      } else {
        console.log(`Role ${role} already exists`);
      }
    }

    await session.commitTransaction();
    console.log("Transaction committed. *");

    session.endSession();
    console.log("session ended");

    console.log("Seeding completed");
  } catch (error) {
    console.error("Error during seeding", error);
  }
};

seedRoles().catch((error) => {
  console.error("Error running seed script", error);
});
