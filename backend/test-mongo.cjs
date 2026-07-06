const mongoose = require('mongoose');

const uri = "mongodb://mkhe_admin:MKHEPassword2026@ac-ib2zwtf-shard-00-00.uecmphb.mongodb.net:27017,ac-ib2zwtf-shard-00-01.uecmphb.mongodb.net:27017,ac-ib2zwtf-shard-00-02.uecmphb.mongodb.net:27017/mkhe_db?ssl=true&replicaSet=atlas-tfzcty-shard-0&authSource=admin&retryWrites=true&w=majority&appName=mkhe-cluster";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
