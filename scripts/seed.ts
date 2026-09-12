import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

import Admin from '../src/models/Admin';
import Project from '../src/models/Project';
import Profile from '../src/models/Profile';
import Skill from '../src/models/Skill';
import Status from '../src/models/Status';
import ApiEndpoint from '../src/models/ApiEndpoint';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB Connected for Seeding');

    // Attempt to read frontend data
    const frontendDataPath = path.resolve(__dirname, '../../../portfolio/src/data/defaultProjects.json');
    let data;
    try {
      const fileData = fs.readFileSync(frontendDataPath, 'utf8');
      data = JSON.parse(fileData);
      console.log('Loaded frontend defaultProjects.json');
    } catch (err) {
      console.error('Could not load frontend data. Ensure the path is correct or provide a local fallback.', err);
      process.exit(1);
    }

    // 1. Seed Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    const adminExists = await Admin.findOne({ email: adminEmail });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);
      await Admin.create({ email: adminEmail, passwordHash });
      console.log('Admin user created');
    }

    // 2. Seed Projects
    if (data.projects && Array.isArray(data.projects)) {
      for (const [index, p] of data.projects.entries()) {
        const projectData = {
          ...p,
          order: p.order !== undefined ? p.order : index
        };
        await Project.findOneAndUpdate(
          { id: p.id },
          projectData,
          { upsert: true, new: true }
        );
      }
      console.log('Projects seeded');
    }

    // 3. Seed Profile
    if (data.apiEndpoints && data.apiEndpoints.profile) {
      const profileCount = await Profile.countDocuments();
      if (profileCount === 0) {
        await Profile.create(data.apiEndpoints.profile);
        console.log('Profile seeded');
      }
    }

    // 4. Seed Skills
    if (data.apiEndpoints && data.apiEndpoints.skills) {
      const skillsCount = await Skill.countDocuments();
      if (skillsCount === 0) {
        await Skill.create(data.apiEndpoints.skills);
        console.log('Skills seeded');
      }
    }

    // 5. Seed Status
    if (data.statusConfig) {
      const statusCount = await Status.countDocuments();
      if (statusCount === 0) {
        await Status.create(data.statusConfig);
        console.log('Status seeded');
      }
    }

    // 6. Seed Generic ApiEndpoints for terminal
    if (data.apiEndpoints) {
      for (const [key, value] of Object.entries(data.apiEndpoints)) {
        await ApiEndpoint.findOneAndUpdate(
          { key },
          { key, data: value },
          { upsert: true, new: true }
        );
      }
      console.log('Generic ApiEndpoints seeded');
    }

    console.log('Seeding process completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
