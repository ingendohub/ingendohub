const mongoose = require('mongoose');
const Trip = require('./models/tripModel'); // Adjust path if needed
require('dotenv').config();

async function migrateDates() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    console.log('Database name:', mongoose.connection.name);

    const trips = await Trip.find({});

    let updatedCount = 0;

    for (const trip of trips) {
      console.log(`Trip ${trip._id} date type:`, typeof trip.date);  // Debug log

      if (typeof trip.date === 'string') {
        try {
          trip.date = new Date(trip.date);
          await trip.save();
          console.log(`Updated trip ${trip._id}`);
          updatedCount++;
          // Optional: small delay to avoid flooding DB
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (err) {
          console.error(`Failed to update trip ${trip._id}:`, err);
        }
      }
    }

    if (updatedCount === 0) {
      console.log('No trips needed updating.');
    } else {
      console.log(`Date migration complete. Updated ${updatedCount} trip(s).`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateDates();






