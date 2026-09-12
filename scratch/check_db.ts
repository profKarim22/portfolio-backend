import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const Admin = mongoose.model('Admin', new mongoose.Schema({ email: String }));
const Project = mongoose.model('Project', new mongoose.Schema({ id: String, title: String, order: Number, isFeatured: Boolean, featured: Boolean }));
const Profile = mongoose.model('Profile', new mongoose.Schema({ name: String }));
const Skill = mongoose.model('Skill', new mongoose.Schema({}));
const Status = mongoose.model('Status', new mongoose.Schema({ mode: String }));
const ApiEndpoint = mongoose.model('ApiEndpoint', new mongoose.Schema({ key: String }));

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("DB_CONNECTED");
    const adminCount = await Admin.countDocuments();
    const projectCount = await Project.countDocuments();
    const profileCount = await Profile.countDocuments();
    const skillCount = await Skill.countDocuments();
    const statusCount = await Status.countDocuments();
    const apiCount = await ApiEndpoint.countDocuments();
    
    console.log(`COUNTS: Admin=${adminCount} Project=${projectCount} Profile=${profileCount} Skill=${skillCount} Status=${statusCount} ApiEndpoint=${apiCount}`);
    
    const projects = await Project.find({}).lean();
    console.log("PROJECTS:");
    projects.forEach(p => console.log(`- ID: ${p.id} | Title: ${p.title} | Order: ${p.order} | Featured: ${p.featured} | isFeatured: ${p.isFeatured}`));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
