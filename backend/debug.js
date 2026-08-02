import mongoose from 'mongoose';
import User from './src/modules/users/user.model.js';

mongoose.connect('mongodb://localhost:27017/mkhe_db').then(async () => {
  const loginId = "loi";
  const user = await User.findOne({ 
      $or: [
        { email: loginId },
        { username: loginId }
      ]
  });
  console.log("Model findOne:", user);
  process.exit(0);
});
