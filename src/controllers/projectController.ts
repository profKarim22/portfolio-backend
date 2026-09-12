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
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: (error as Error).message } });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id as string;
    const project = await Project.findOneAndUpdate(
      { $or: [{ _id: projectId.match(/^[0-9a-fA-F]{24}$/) ? projectId : null }, { id: projectId }] },
      req.body,
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
    const { orderedIds } = req.body;
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, error: { message: 'orderedIds array is required' } });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { id },
        update: { order: index }
      }
    }));

    await Project.bulkWrite(bulkOps);
    res.json({ success: true, data: { message: 'Projects reordered successfully' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: (error as Error).message } });
  }
};
