import mongoose from "mongoose";
import ProjectModel from "../models/project.model";
import { NotFoundException } from "../utils/appError";
import TaskModel from "../models/task.modle";
import { TaskStatusEnum } from "../enums/task.enum";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";

//! CREATE A NEW PROJECT IN WORKSPACE
export const createProjectService = async (
  userId: string,
  workspaceId: string,
  body: {
    name: string;
    description?: string;
    emoji?: string;
  }
) => {
  const project = new ProjectModel({
    ...(body.emoji && { emoji: body.emoji }),
    name: body.name,
    description: body.description,
    workspace: workspaceId,
    createdBy: userId,
  });
  await project.save();

  return {
    project,
  };
};

//! GET PROJECTS IN WORKSPACE
export const getProjectsInWorkspaceService = async (
  workspaceId: string,
  pageNumber: number,
  pageSize: number
) => {
  // Step 1: Find all projects in the workspace
  const skip = (pageNumber - 1) * pageSize;

  const projects = await ProjectModel.find({ workspace: workspaceId })
    .skip(skip)
    .limit(pageSize)
    .populate("createdBy", "_id name profilePicture -password")
    .sort({ createdAt: -1 });

  const totalCount = await ProjectModel.countDocuments({
    workspace: workspaceId,
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return { projects, totalCount, totalPages, skip };
};

export const getProjectByIdAndWorkspaceService = async (
  workspaceId: string,
  projectId: string
) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  }).select("_id emoji name description");

  if (!project)
    throw new NotFoundException(
      "Project not found Or does not belong the specified project"
    );

  return { project };
};

//! GET PROJECT ANALYTICS
export const getProjectAnalyticsService = async (
  projectId: string,
  workspaceId: string
) => {
  const project = await ProjectModel.findById(projectId);

  if (!projectId || project?.workspace.toString() !== workspaceId) {
    throw new NotFoundException(
      "Project not found Or does not belong the specified workspace"
    );
  }

  const currentDate = new Date();
  const taskAnalytics = await TaskModel.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $facet: {
        totalTasks: [{ $count: "count" }],
        overdueTasks: [
          {
            $match: {
              dueDate: { $lt: currentDate },
              status: {
                $ne: TaskStatusEnum.DONE,
              },
            },
          },
          {
            $count: "count",
          },
        ],
        completedTasks: [
          {
            $match: {
              status: TaskStatusEnum.DONE,
            },
          },
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  const _analytics = taskAnalytics[0];
  const analytics = {
    totalTasks: _analytics.totalTasks[0]?.count || 0,
    overdueTasks: _analytics.overdueTasks[0]?.count || 0,
    completedTasks: _analytics.completedTasks[0]?.count || 0,
  };

  return {
    analytics,
  };
};

//! UPDATE PROJECT SERVICE
export const updateProjectService = async (
  workspaceId: string,
  projectId: string,
  body: {
    name: string;
    description?: string;
    emoji?: string;
  }
) => {
  const { name, emoji, description } = body;

  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project)
    throw new NotFoundException(
      "Project not found or does not exist in the workspace"
    );

  if (emoji) project.emoji = emoji;
  if (name) project.name = name;
  if (description) project.description = description;

  await project.save();

  return { project };
};

export const deleteProjectService = async (
  workspaceId: string,
  projectId: string
) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project)
    throw new NotFoundException(
      "Project not found or does not exist in the workspace"
    );
  await project.deleteOne();

  await TaskModel.deleteMany({
    project: project._id,
  });

  return project;
};
