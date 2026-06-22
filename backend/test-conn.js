require("dotenv").config();
const dns = require("dns");
const mongoose = require("mongoose");

// Try with explicit DNS server
dns.setServers(["8.8.8.8", "1.1.1.1"]);

dns.resolveSrv("_mongodb._tcp.qb.xu6itku.mongodb.net", (err, records) => {
  if (err) {
    console.log("SRV error:", err.code);
    // Try once more with original string
    return mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 })
      .then(() => console.log("OK"))
      .catch(e => console.log("FAIL:", e.message))
      .finally(() => process.exit(0));
  }
  console.log("Records:", records.map(r => r.name));
  
  const hosts = records.map(r => `${r.name}:${r.port}`).join(",");
  const uri = `mongodb://${hosts}/xpresidb?ssl=true&authSource=admin&retryWrites=true&w=majority`;
  
  mongoose.connect(uri, { user: "Ace", pass: "VZehEx5FtfoJZIAK", serverSelectionTimeoutMS: 15000 })
    .then(() => console.log("OK"))
    .catch(e => console.log("FAIL:", e.message))
    .finally(() => process.exit(0));
});
