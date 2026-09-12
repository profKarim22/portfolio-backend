import { Request, Response } from 'express';
import Profile from '../models/Profile';
import Skill from '../models/Skill';
import Status from '../models/Status';
import ApiEndpoint from '../models/ApiEndpoint';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const profile = await Profile.findOne();
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: (error as Error).message } });
  }
};

export const getSkills = async (req: Request, res: Response) => {
  try {
    const skills = await Skill.findOne();
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: (error as Error).message } });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    const status = await Status.findOne();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: (error as Error).message } });
  }
};

export const getApiEndpoint = async (req: Request, res: Response) => {
  try {
    const endpoint = await ApiEndpoint.findOne({ key: req.params.key });
    if (endpoint) {
      res.json({ success: true, data: endpoint.data });
    } else {
      res.status(404).json({ success: false, error: { message: 'Endpoint data not found' } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: { message: (error as Error).message } });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    let status = await Status.findOne();
    if (status) {
      status = await Status.findOneAndUpdate({}, req.body, { new: true });
    } else {
      status = await Status.create(req.body);
    }
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: (error as Error).message } });
  }
};

export const updateApiEndpoint = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const endpoint = await ApiEndpoint.findOneAndUpdate(
      { key },
      { key, data: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: endpoint });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: (error as Error).message } });
  }
};
