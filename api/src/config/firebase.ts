import dotenv from "dotenv";
import admin from "firebase-admin";
import path from "path";

dotenv.config();

const serviceAccount = require(
  path.join(__dirname, "../config/firebase-service-account.json")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
