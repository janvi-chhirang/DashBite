import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import DeliveryAssignment from "./models/deliveryAssignment.model.js";

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to DB\n");

  const stuck = await DeliveryAssignment.find({ status: "Assigned" });

  if (stuck.length === 0) {
    console.log("No stuck 'Assigned' assignments found. Nothing to do.");
  } else {
    console.log(`Found ${stuck.length} 'Assigned' assignment(s):`);
    stuck.forEach((a) =>
      console.log(`- ${a._id} | assignedTo: ${a.assignedTo}`)
    );

    const result = await DeliveryAssignment.updateMany(
      { status: "Assigned" },
      { $set: { status: "Completed" } }
    );

    console.log(`\n✅ Marked ${result.modifiedCount} assignment(s) as "Completed".`);
    console.log("Delivery boys tied to these are now free for new broadcasts.");
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Cleanup script error:", err);
  process.exit(1);
});
