import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { defaultData as backendSeedData } from '../src/data/seedData';

dotenv.config();

const frontendPath = '/media/prof/New Volume/PROJECTS/portfolio/src/data/defaultProjects.json';
const frontendData = JSON.parse(fs.readFileSync(frontendPath, 'utf8'));

console.log("=== FRONTEND VS SEED_DATA ===");
const frontendProjects = frontendData.projects || [];
const seedProjects = backendSeedData.projects || [];

frontendProjects.forEach(fp => {
  const sp = seedProjects.find(p => p.id === fp.id);
  if (!sp) {
    console.log(`MISSING IN SEED: Project ${fp.id}`);
  } else {
    // Basic comparison
    let diffs = [];
    if (fp.title !== sp.title) diffs.push(`title: ${fp.title} != ${sp.title}`);
    if (fp.description !== sp.description) diffs.push(`desc: ${fp.description} != ${sp.description}`);
    if (diffs.length > 0) {
      console.log(`DIFFERENT IN SEED: Project ${fp.id} -> ${diffs.join(', ')}`);
    } else {
      console.log(`MATCH IN SEED: Project ${fp.id}`);
    }
  }
});
seedProjects.forEach(sp => {
  if (!frontendProjects.find(p => p.id === sp.id)) {
    console.log(`SEED ONLY (NOT IN FRONTEND): Project ${sp.id}`);
  }
});

console.log("\n=== DB VS FRONTEND ===");

const Admin = mongoose.model('Admin', new mongoose.Schema({ email: String }));
const Project = mongoose.model('Project', new mongoose.Schema({ id: String, title: String, order: Number, isFeatured: Boolean, featured: Boolean, description: String }, { strict: false }));

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log(`LOCAL DB HOST: ${mongoose.connection.host}`);
  
  const dbProjects = await Project.find({}).lean();
  
  console.log(`DB Counts -> Admin: ${await Admin.countDocuments()}, Project: ${dbProjects.length}`);
  
  frontendProjects.forEach(fp => {
    const dbp = dbProjects.find(p => p.id === fp.id);
    if (!dbp) {
      console.log(`MISSING FROM DATABASE: Project ${fp.id}`);
    } else {
      let diffs = [];
      if (fp.title !== dbp.title) diffs.push(`title diff`);
      if (fp.description !== dbp.description) diffs.push(`desc diff`);
      
      if (diffs.length > 0) {
        console.log(`DIFFERENT CONTENT: Project ${fp.id}`);
      } else {
        console.log(`MATCH: Project ${fp.id}`);
      }
    }
  });
  
  dbProjects.forEach(dbp => {
    if (!frontendProjects.find(p => p.id === dbp.id)) {
      console.log(`DATABASE ONLY: Project ${dbp.id}`);
    }
  });

  process.exit(0);
}
run();
