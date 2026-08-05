import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.collections();
    
    // Check if the "users" collection exists
    const userCollection = collections.find(c => c.collectionName === "users");
    
    if (userCollection) {
      const indexes = await userCollection.indexes();
      const hasEmailIndex = indexes.some(idx => idx.name === "email_1");
      
      if (hasEmailIndex) {
        await userCollection.dropIndex("email_1");
        console.log("SUCCESS: Index email_1 dropped successfully.");
      } else {
        console.log("INFO: Index email_1 does not exist, nothing to drop.");
      }
    } else {
      console.log("INFO: users collection not found.");
    }
  } catch (e) {
    console.error("ERROR:", e);
  } finally {
    process.exit(0);
  }
});
