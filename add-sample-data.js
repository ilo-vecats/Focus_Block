const mongoose = require('mongoose');
const Blocked = require('./models/Blocked');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/focusblock', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleWebsites = [
  'facebook.com',
  'youtube.com',
  'twitter.com',
  'instagram.com',
  'tiktok.com',
  'reddit.com',
  'netflix.com',
  'twitch.tv',
  'discord.com',
  'snapchat.com'
];

async function addSampleData() {
  try {
    // Find the first user (assuming you have at least one user)
    const user = await User.findOne();
    
    if (!user) {
      console.log('No users found. Please register a user first.');
      return;
    }

    console.log(`Adding sample websites for user: ${user.username}`);

    // Clear existing blocked sites for this user
    await Blocked.deleteMany({ user: user._id });
    console.log('Cleared existing blocked sites');

    // Add sample websites
    const blockedSites = sampleWebsites.map(url => ({
      url,
      user: user._id,
      createdAt: new Date()
    }));

    await Blocked.insertMany(blockedSites);
    console.log(`Added ${sampleWebsites.length} sample websites:`);
    sampleWebsites.forEach(site => console.log(`  - ${site}`));

    console.log('\nSample data added successfully!');
    console.log('Now you can login and see the blocked websites list populated.');

  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    mongoose.connection.close();
  }
}

addSampleData();
