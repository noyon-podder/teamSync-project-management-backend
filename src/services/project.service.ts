import ProjectModel from "../models/project.model";

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
