import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const Admin = mongoose.model('Admin', new mongoose.Schema({}, { strict: false }));
const Project = mongoose.model('Project', new mongoose.Schema({}, { strict: false }));
const Profile = mongoose.model('Profile', new mongoose.Schema({}, { strict: false }));
const Skill = mongoose.model('Skill', new mongoose.Schema({}, { strict: false }));
const Status = mongoose.model('Status', new mongoose.Schema({}, { strict: false }));
const ApiEndpoint = mongoose.model('ApiEndpoint', new mongoose.Schema({}, { strict: false }));

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to MongoDB for backup");
    const data = {
      admins: await Admin.find({}).lean(),
      projects: await Project.find({}).lean(),
      profiles: await Profile.find({}).lean(),
      skills: await Skill.find({}).lean(),
      status: await Status.find({}).lean(),
      apiEndpoints: await ApiEndpoint.find({}).lean(),
    };
    fs.writeFileSync(path.join(__dirname, 'db_backup.json'), JSON.stringify(data, null, 2));
    console.log("Backup saved to scratch/db_backup.json");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
