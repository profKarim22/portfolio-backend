import { Request, Response } from 'express';
import Profile from '../models/Profile';
import Skill from '../models/Skill';
import Status from '../models/Status';
import ApiEndpoint from '../models/ApiEndpoint';
import { defaultData } from '../data/seedData';

export const getProfile = async (req: Request, res: Response) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      const endpoint = await ApiEndpoint.findOne({ key: 'profile' });
      if (endpoint?.data) {
        return res.json({ success: true, data: endpoint.data });
      }
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: (error as Error).message } });
  }
};

export const getSkills = async (req: Request, res: Response) => {
  try {
    let skills = await Skill.findOne();
    if (!skills) {
      const endpoint = await ApiEndpoint.findOne({ key: 'skills' });
      if (endpoint?.data) {
        return res.json({ success: true, data: endpoint.data });
      }
    }
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: (error as Error).message } });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    let status = await Status.findOne();
    if (!status) {
      const endpoint = await ApiEndpoint.findOne({ key: 'status' });
      if (endpoint?.data) {
        return res.json({ success: true, data: endpoint.data });
      }
    }
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
    const rawBody = req.body;
    let mode: string = 'available';
    let modes: any = undefined;

    if (typeof rawBody === 'string') {
      mode = rawBody.trim();
    } else if (rawBody && typeof rawBody === 'object') {
      mode = rawBody.mode || rawBody.status || 'available';
      if (rawBody.modes) {
        modes = rawBody.modes;
      }
    }

    let status = await Status.findOne();
    if (status) {
      status.mode = mode;
      if (modes) {
        status.modes = modes;
      }
      await status.save();
    } else {
      status = await Status.create({
        mode,
        modes: modes || defaultData.statusConfig.modes,
      });
    }

    // Synchronize with ApiEndpoint 'status'
    try {
      await ApiEndpoint.findOneAndUpdate(
        { key: 'status' },
        {
          key: 'status',
          data: {
            portfolio: mode === 'offgrid' ? 'Off-Grid' : 'Online',
            api_console: 'Interactive',
            data_format: 'JSON',
            availability: mode === 'available' ? 'Public' : mode === 'committed' ? 'Contracted' : 'Off-Grid',
          },
        },
        { upsert: true }
      );
    } catch (_) {}

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

    // Synchronize with specialized models if applicable
    if (key === 'profile' && req.body && typeof req.body === 'object') {
      try {
        await Profile.findOneAndUpdate({}, req.body, { upsert: true, new: true });
      } catch (_) {}
    } else if (key === 'skills' && req.body && typeof req.body === 'object') {
      try {
        await Skill.findOneAndUpdate({}, req.body, { upsert: true, new: true });
      } catch (_) {}
    }

    res.json({ success: true, data: endpoint });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: (error as Error).message } });
  }
};

