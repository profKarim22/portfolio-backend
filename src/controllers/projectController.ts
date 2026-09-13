import { Request, Response } from 'express';
import Project from '../models/Project';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find().sort({ order: 1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: (error as Error).message } });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id as string;
    const project = await Project.findOne({ 
      $or: [{ _id: projectId.match(/^[0-9a-fA-F]{24}$/) ? projectId : null }, { id: projectId }] 
    });
    
    if (project) {
      res.json({ success: true, data: project });
    } else {
      res.status(404).json({ success: false, error: { message: 'Project not found' } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: { message: (error as Error).message } });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const projectData = { ...req.body };

    // Auto-generate unique string id if missing or empty
    if (!projectData.id || typeof projectData.id !== 'string' || !projectData.id.trim()) {
      const baseSlug = (projectData.title || 'project')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'project';
      const existing = await Project.findOne({ id: baseSlug });
      projectData.id = existing ? `${baseSlug}-${Date.now()}` : baseSlug;
    }

    // Synchronize paired fields
    if (projectData.tech && !projectData.techStack) projectData.techStack = projectData.tech;
    if (projectData.techStack && !projectData.tech) projectData.tech = projectData.techStack;
    if (projectData.github && !projectData.githubUrl) projectData.githubUrl = projectData.github;
    if (projectData.githubUrl && !projectData.github) projectData.github = projectData.githubUrl;
    if (projectData.liveDemo && !projectData.liveUrl) projectData.liveUrl = projectData.liveDemo;
    if (projectData.liveUrl && !projectData.liveDemo) projectData.liveDemo = projectData.liveUrl;
    if (projectData.figmaLink && !projectData.figmaUrl) projectData.figmaUrl = projectData.figmaLink;
    if (projectData.figmaUrl && !projectData.figmaLink) projectData.figmaLink = projectData.figmaUrl;
    if (projectData.isFeatured !== undefined && projectData.featured === undefined) {
      projectData.featured = projectData.isFeatured;
    } else if (projectData.featured !== undefined && projectData.isFeatured === undefined) {
      projectData.isFeatured = projectData.featured;
    }

    if (projectData.order === undefined) {
      const count = await Project.countDocuments();
      projectData.order = count;
    }

    delete projectData._id;
    delete projectData.__v;

    const project = await Project.create(projectData);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: (error as Error).message } });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id as string;
    const updateData = { ...req.body };

    // Strip immutable fields
    delete updateData._id;
    delete updateData.__v;

    // Synchronize paired fields
    if (updateData.tech && !updateData.techStack) updateData.techStack = updateData.tech;
    if (updateData.techStack && !updateData.tech) updateData.tech = updateData.techStack;
    if (updateData.github && !updateData.githubUrl) updateData.githubUrl = updateData.github;
    if (updateData.githubUrl && !updateData.github) updateData.github = updateData.githubUrl;
    if (updateData.liveDemo !== undefined && updateData.liveUrl === undefined) updateData.liveUrl = updateData.liveDemo;
    if (updateData.liveUrl !== undefined && updateData.liveDemo === undefined) updateData.liveDemo = updateData.liveUrl;
    if (updateData.figmaLink !== undefined && updateData.figmaUrl === undefined) updateData.figmaUrl = updateData.figmaLink;
    if (updateData.figmaUrl !== undefined && updateData.figmaLink === undefined) updateData.figmaLink = updateData.figmaUrl;
    if (updateData.isFeatured !== undefined && updateData.featured === undefined) {
      updateData.featured = updateData.isFeatured;
    } else if (updateData.featured !== undefined && updateData.isFeatured === undefined) {
      updateData.isFeatured = updateData.featured;
    }

    const project = await Project.findOneAndUpdate(
      { $or: [{ _id: projectId.match(/^[0-9a-fA-F]{24}$/) ? projectId : null }, { id: projectId }] },
      updateData,
      { new: true, runValidators: true }
    );
    if (project) {
      res.json({ success: true, data: project });
    } else {
      res.status(404).json({ success: false, error: { message: 'Project not found' } });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: { message: (error as Error).message } });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id as string;
    const project = await Project.findOneAndDelete({
      $or: [{ _id: projectId.match(/^[0-9a-fA-F]{24}$/) ? projectId : null }, { id: projectId }]
    });
    if (project) {
      res.json({ success: true, data: {} });
    } else {
      res.status(404).json({ success: false, error: { message: 'Project not found' } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: { message: (error as Error).message } });
  }
};

export const reorderProjects = async (req: Request, res: Response) => {
  try {
    const orderedIds = req.body.orderedIds || req.body.projectIds;
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, error: { message: 'orderedIds or projectIds array is required' } });
    }

    const bulkOps = orderedIds.map((id: string, index: number) => ({
      updateOne: {
        filter: {
          $or: [
            { id: String(id) },
            { _id: String(id).match(/^[0-9a-fA-F]{24}$/) ? id : null }
          ]
        },
        update: { $set: { order: index } }
      }
    }));

    await Project.bulkWrite(bulkOps);
    res.json({ success: true, data: { message: 'Projects reordered successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: (error as Error).message } });
  }
};
