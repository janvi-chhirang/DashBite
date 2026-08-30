import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./models/user.model.js";
import DeliveryAssignment from "./models/deliveryAssignment.model.js";

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to DB\n");

  console.log("========== DELIVERY-BOY USERS ==========");
  const boys = await User.find({ role: /delivery[- ]?boy/i }).select(
    "fullName email role location"
  );

  if (boys.length === 0) {
    console.log("❌ No user found with role Delivery-Boy in the database.");
  } else {
    boys.forEach((b) => {
      const coords = b.location?.coordinates || [0, 0];
      const isDefault = coords[0] === 0 && coords[1] === 0;
      console.log(
        `- ${b.fullName} (${b.email}) | role: "${b.role}" | coordinates: [${coords}] ${
          isDefault ? "  ⚠️  DEFAULT/UNSET LOCATION" : ""
        }`
      );
    });
  }

  console.log("\n========== DELIVERY ASSIGNMENTS ==========");
  const assignments = await DeliveryAssignment.find({}).select(
    "status assignedTo brodcastedTo order shop createdAt"
  );

  if (assignments.length === 0) {
    console.log("No DeliveryAssignment documents exist yet.");
  } else {
    assignments.forEach((a) => {
      console.log(
        `- id: ${a._id} | status: ${a.status} | assignedTo: ${a.assignedTo || "none"} | broadcastedTo: ${a.brodcastedTo.length} boy(s) | createdAt: ${a.createdAt}`
      );
    });

    const stuck = assignments.filter((a) => a.status === "Assigned");
    if (stuck.length > 0) {
      console.log(
        `\n⚠️  ${stuck.length} assignment(s) currently "Assigned" — the delivery boy(s) tied to these will be treated as BUSY and skipped in future broadcasts, until marked "Completed".`
      );
    }
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Debug script error:", err);
  process.exit(1);
});
