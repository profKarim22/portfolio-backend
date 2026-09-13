import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { defaultData as data } from '../src/data/seedData';
import Admin from '../src/models/Admin';
import Project from '../src/models/Project';
import Profile from '../src/models/Profile';
import Skill from '../src/models/Skill';
import Status from '../src/models/Status';
import ApiEndpoint from '../src/models/ApiEndpoint';

dotenv.config();

const safeSeed = async () => {
  if (!process.argv.includes('--confirm')) {
    console.warn("⚠️ SAFE SEED MODE: You must run this script with --confirm to execute any inserts.");
    console.warn("Usage: npm run seed -- --confirm");
    process.exit(0);
  }

  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    await mongoose.connect(uri);
    console.log('MongoDB Connected for Safe Seeding');

    // 1. Seed Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    const adminExists = await Admin.findOne({ email: adminEmail });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);
      await Admin.create({ email: adminEmail, passwordHash });
      console.log('✅ Admin user created');
    } else {
      console.log('⏭️  PRESERVED: Admin user already exists');
    }

    // 2. Seed Projects
    if (data.projects && Array.isArray(data.projects)) {
      for (const [index, pRaw] of data.projects.entries()) {
        const p = pRaw as any;
        const projectData = {
          ...p,
          order: p.order !== undefined ? p.order : index
        };
        const existingProject = await Project.findOne({ id: p.id });
        if (!existingProject) {
          await Project.create(projectData);
          console.log(`✅ INSERTED: Project ${p.id}`);
        } else {
          // Deep or simple comparison to detect difference
          let isDifferent = false;
          if (existingProject.title !== p.title) isDifferent = true;
          if (existingProject.description !== p.description) isDifferent = true;
          
          if (isDifferent) {
            console.log(`⚠️ DIFFERENCE DETECTED: Project ${p.id}. Did not overwrite authentic data.`);
          } else {
            console.log(`⏭️  PRESERVED: Project ${p.id} exists and matches.`);
          }
        }
      }
    }

    // 3. Seed Profile
    if (data.apiEndpoints && data.apiEndpoints.profile) {
      const profileCount = await Profile.countDocuments();
      if (profileCount === 0) {
        await Profile.create(data.apiEndpoints.profile);
        console.log('✅ Profile seeded');
      } else {
         console.log('⏭️  PRESERVED: Profile already exists.');
      }
    }

    // 4. Seed Skills
    if (data.apiEndpoints && data.apiEndpoints.skills) {
      const skillsCount = await Skill.countDocuments();
      if (skillsCount === 0) {
        await Skill.create(data.apiEndpoints.skills);
        console.log('✅ Skills seeded');
      } else {
         console.log('⏭️  PRESERVED: Skills already exist.');
      }
    }

    // 5. Seed Status
    if (data.statusConfig) {
      const statusCount = await Status.countDocuments();
      if (statusCount === 0) {
        await Status.create(data.statusConfig);
        console.log('✅ Status seeded');
      } else {
         console.log('⏭️  PRESERVED: Status already exists.');
      }
    }

    // 6. Seed Generic ApiEndpoints for terminal
    if (data.apiEndpoints) {
      for (const [key, value] of Object.entries(data.apiEndpoints)) {
        const existingEndpoint = await ApiEndpoint.findOne({ key });
        if (!existingEndpoint) {
          await ApiEndpoint.create({ key, data: value });
          console.log(`✅ INSERTED: ApiEndpoint ${key}`);
        } else {
           console.log(`⏭️  PRESERVED: ApiEndpoint ${key} already exists.`);
        }
      }
    }

    console.log('🎉 Safe Seeding process completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(1);
  }
};

safeSeed();
