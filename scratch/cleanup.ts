import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const Project = mongoose.model('Project', new mongoose.Schema({ id: String, title: String }, { strict: false }));
const Profile = mongoose.model('Profile', new mongoose.Schema({}, { strict: false }));
const Skill = mongoose.model('Skill', new mongoose.Schema({}, { strict: false }));
const Status = mongoose.model('Status', new mongoose.Schema({}, { strict: false }));
const ApiEndpoint = mongoose.model('ApiEndpoint', new mongoose.Schema({}, { strict: false }));

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to MongoDB for targeted cleanup");
    
    // Verify authentic projects
    const expected = ['algorithmic-storytelling', 'event-system', 'portfolio-site', 'user-greeting'];
    const dbProjects = await Project.find({}).lean();
    
    const missing = expected.filter(id => !dbProjects.find(p => p.id === id));
    if (missing.length > 0) {
      console.error("Missing authentic projects:", missing);
      process.exit(1);
    }
    
    // Verify Profile, Skill, Status, ApiEndpoint
    const profileCount = await Profile.countDocuments();
    const skillCount = await Skill.countDocuments();
    const statusCount = await Status.countDocuments();
    const apiCount = await ApiEndpoint.countDocuments();
    
    if (profileCount === 0 || skillCount === 0 || statusCount === 0 || apiCount === 0) {
      console.error("Missing static authentic data (Profile, Skill, Status, or ApiEndpoint)");
      process.exit(1);
    }
    
    console.log("Verification passed: Authentic data is intact.");
    
    // Remove dummy project
    const dummyId = 'portfolio-backend';
    const deleted = await Project.deleteOne({ id: dummyId });
    if (deleted.deletedCount > 0) {
      console.log(`Successfully removed dummy project: ${dummyId}`);
    } else {
      console.log(`Dummy project ${dummyId} not found in DB.`);
    }
    
    const finalCount = await Project.countDocuments();
    console.log(`Final project count: ${finalCount}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
