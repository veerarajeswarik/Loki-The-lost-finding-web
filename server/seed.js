 
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { isConfigured } from './config/env.js';
import { User } from './models/User.js';
import { Item } from './models/Item.js';
import { Match } from './models/Match.js';
import { VerificationRequest } from './models/VerificationRequest.js';
import { Notification } from './models/Notification.js';
import { Reward } from './models/Reward.js';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const img = (text) =>
  `https://placehold.co/600x400/16a34a/ffffff?text=${encodeURIComponent(text)}`;

async function run() {
  if (!isConfigured('mongo')) {
    console.error('MONGO_URI is not set. Add it to server/.env before seeding.');
    process.exit(1);
  }
  const connected = await connectDB();
  if (!connected) {
    console.error('Could not connect to MongoDB. Check MONGO_URI.');
    process.exit(1);
  }

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Item.deleteMany({}),
    Match.deleteMany({}),
    VerificationRequest.deleteMany({}),
    Notification.deleteMany({}),
    Reward.deleteMany({}),
  ]);

  console.log('Creating demo users...');
  const [, security, alice, bob, carol, dave] = await User.create([
    {
      firebaseUid: 'dev-admin',
      name: 'Admin Anita',
      email: 'admin@lokii.dev',
      role: 'admin',
      department: 'IT Services',
      interests: ['system design', 'cloud', 'career'],
    },
    {
      firebaseUid: 'dev-security',
      name: 'Officer Sam',
      email: 'security@lokii.dev',
      role: 'security',
      department: 'Campus Security',
    },
    {
      firebaseUid: 'dev-alice',
      name: 'Alice Kumar',
      email: 'alice@lokii.dev',
      role: 'student',
      department: 'Computer Science',
      interests: ['web development', 'react', 'interview prep'],
    },
    {
      firebaseUid: 'dev-bob',
      name: 'Bob Singh',
      email: 'bob@lokii.dev',
      role: 'student',
      department: 'Electronics',
      interests: ['embedded systems', 'iot', 'career'],
      stats: { itemsReturned: 2, itemsRecovered: 0, trustScore: 62 },
    },
    {
      firebaseUid: 'dev-carol',
      name: 'Carol Mendez',
      email: 'carol@lokii.dev',
      role: 'faculty',
      department: 'Mathematics',
      interests: ['data science', 'python'],
    },
    {
      firebaseUid: 'dev-dave',
      name: 'Dave Patel',
      email: 'dave@lokii.dev',
      role: 'staff',
      department: 'Library',
      interests: ['ux design', 'accessibility'],
    },
  ]);

  console.log('Creating lost & found items...');
  const lostItems = await Item.create([
    {
      type: 'lost', title: 'Black Dell XPS 13 laptop', category: 'electronics',
      description: 'Silver-black Dell XPS 13 with a React sticker on the lid. Lost near the library.',
      images: [{ url: img('Dell XPS 13'), publicId: '' }],
      location: { name: 'Central Library', details: '2nd floor reading room' },
      dateLostOrFound: daysAgo(3), reportedBy: alice._id,
      aiSummary: 'electronics: black Dell XPS 13 laptop with React sticker',
    },
    {
      type: 'lost', title: 'Blue Hydro Flask bottle', category: 'accessories',
      description: 'Navy blue 32oz Hydro Flask with a few dents and a mountain sticker.',
      images: [{ url: img('Blue Bottle'), publicId: '' }],
      location: { name: 'Sports Complex', details: 'near basketball court' },
      dateLostOrFound: daysAgo(1), reportedBy: bob._id,
    },
    {
      type: 'lost', title: 'Student ID card - Alice Kumar', category: 'ID cards',
      description: 'CS department student ID card, name Alice Kumar, roll 21CS045.',
      images: [{ url: img('ID Card'), publicId: '' }],
      location: { name: 'Cafeteria', details: 'lunch counter area' },
      dateLostOrFound: daysAgo(2), reportedBy: alice._id,
    },
    {
      type: 'lost', title: 'Calculus textbook (Stewart)', category: 'books',
      description: 'Stewart Calculus 8th edition, name written inside cover, highlighted chapters.',
      location: { name: 'Math Building', details: 'Room 204' },
      dateLostOrFound: daysAgo(5), reportedBy: carol._id,
    },
    {
      type: 'lost', title: 'Car keys with red keychain', category: 'keys',
      description: 'Honda car keys on a red leather keychain with a small bell.',
      location: { name: 'Parking Lot B', details: 'near entrance' },
      dateLostOrFound: daysAgo(4), reportedBy: dave._id,
    },
    {
      type: 'lost', title: 'Grey hoodie - size M', category: 'clothing',
      description: 'Grey Nike hoodie, size M, small ink stain on right sleeve.',
      location: { name: 'Lecture Hall 3' }, dateLostOrFound: daysAgo(6), reportedBy: bob._id,
    },
    {
      type: 'lost', title: 'Wireless earbuds (white)', category: 'electronics',
      description: 'White wireless earbuds in a charging case with a small scratch.',
      location: { name: 'Bus Stop' }, dateLostOrFound: daysAgo(2), reportedBy: carol._id,
    },
    {
      type: 'lost', title: 'Silver wristwatch', category: 'accessories',
      description: 'Silver analog wristwatch, leather strap, engraving on the back.',
      location: { name: 'Gymnasium' }, dateLostOrFound: daysAgo(7), reportedBy: alice._id,
    },
    {
      type: 'lost', title: 'Spiral notebook - Physics', category: 'books',
      description: 'Blue spiral notebook labeled Physics with lab notes.',
      location: { name: 'Physics Lab' }, dateLostOrFound: daysAgo(3), reportedBy: dave._id,
    },
    {
      type: 'lost', title: 'Prescription glasses', category: 'accessories',
      description: 'Black-framed prescription glasses in a brown case.',
      location: { name: 'Auditorium' }, dateLostOrFound: daysAgo(1), reportedBy: bob._id,
    },
  ]);

  const foundItems = await Item.create([
    {
      type: 'found', title: 'Dell laptop found in library', category: 'electronics',
      description: 'Found a dark Dell laptop with a colorful sticker on the lid on a library desk.',
      images: [{ url: img('Found Laptop'), publicId: '' }],
      location: { name: 'Central Library', details: '2nd floor, table 12' },
      dateLostOrFound: daysAgo(2), reportedBy: dave._id,
      privateDetails: 'It has a blue React logo sticker on the lid and the wallpaper is a mountain landscape. A faint scratch near the trackpad.',
      aiSummary: 'electronics: dark Dell laptop with sticker found in library',
    },
    {
      type: 'found', title: 'Blue metal water bottle', category: 'accessories',
      description: 'Blue insulated bottle found near the courts, has some stickers.',
      images: [{ url: img('Found Bottle'), publicId: '' }],
      location: { name: 'Sports Complex' }, dateLostOrFound: daysAgo(1), reportedBy: carol._id,
      privateDetails: 'Mountain sticker on the front, two dents on the base, 32oz Hydro Flask brand.',
    },
    {
      type: 'found', title: 'Found car keys - red keychain', category: 'keys',
      description: 'Set of car keys with a red keychain found in the parking area.',
      location: { name: 'Parking Lot B' }, dateLostOrFound: daysAgo(3), reportedBy: security._id,
      privateDetails: 'Honda branded key, small brass bell attached, red leather fob.',
    },
    {
      type: 'found', title: 'White earbuds case', category: 'electronics',
      description: 'White earbuds with case found on a bus stop bench.',
      location: { name: 'Bus Stop' }, dateLostOrFound: daysAgo(1), reportedBy: alice._id,
      privateDetails: 'Small scratch on the lid, left earbud has a faint mark.',
    },
    {
      type: 'found', title: 'Grey hoodie found', category: 'clothing',
      description: 'Grey branded hoodie found in a lecture hall.',
      location: { name: 'Lecture Hall 3' }, dateLostOrFound: daysAgo(5), reportedBy: security._id,
      privateDetails: 'Nike brand, size M, ink stain on the right sleeve.',
    },
    {
      type: 'found', title: 'Textbook left in classroom', category: 'books',
      description: 'A calculus textbook left behind after class, some highlighting.',
      location: { name: 'Math Building' }, dateLostOrFound: daysAgo(4), reportedBy: bob._id,
      privateDetails: 'Stewart Calculus 8th edition, a name is written inside the front cover.',
    },
    {
      type: 'found', title: 'Student ID card found', category: 'ID cards',
      description: 'A student ID card found near the cafeteria counter.',
      location: { name: 'Cafeteria' }, dateLostOrFound: daysAgo(2), reportedBy: dave._id,
      privateDetails: 'CS department, roll number ends in 045.',
    },
    {
      type: 'found', title: 'Silver watch found in gym', category: 'accessories',
      description: 'A silver analog watch found on a bench in the gym.',
      location: { name: 'Gymnasium' }, dateLostOrFound: daysAgo(6), reportedBy: carol._id,
      privateDetails: 'Leather strap, an engraving on the back of the case.',
    },
    {
      type: 'found', title: 'Black glasses in case', category: 'accessories',
      description: 'Black framed glasses inside a brown case found in the auditorium.',
      location: { name: 'Auditorium' }, dateLostOrFound: daysAgo(1), reportedBy: bob._id,
      privateDetails: 'Prescription lenses, brown hard case.',
    },
    {
      type: 'found', title: 'Blue physics notebook', category: 'books',
      description: 'A blue spiral notebook with physics notes found in the lab.',
      location: { name: 'Physics Lab' }, dateLostOrFound: daysAgo(2), reportedBy: alice._id,
      privateDetails: 'Labeled "Physics" with lab notes and a name on the first page.',
    },
  ]);

  console.log('Building a full demo flow (match -> verification -> recovery -> reward)...');
  const lostLaptop = lostItems[0]; // Alice's Dell XPS
  const foundLaptop = foundItems[0]; // Dave found it
  const finder = dave;
  const owner = alice;

  // Match
  const match = await Match.create({
    lostItem: lostLaptop._id,
    foundItem: foundLaptop._id,
    aiConfidenceScore: 88,
    aiReasoning:
      'Both are dark Dell laptops with a distinctive sticker on the lid, reported in the Central Library within a day of each other.',
    status: 'completed',
    acceptedBy: owner._id,
  });

  // Verification (approved)
  await VerificationRequest.create({
    match: match._id,
    claimant: owner._id,
    questions: [
      'What logo/sticker is on the lid of the laptop?',
      'What is the desktop wallpaper?',
      'Are there any scratches, and where?',
    ],
    answers: [
      'A blue React logo sticker.',
      'A mountain landscape wallpaper.',
      'A faint scratch near the trackpad.',
    ],
    aiScore: 94,
    aiFeedback: 'Answers closely match the recorded private details.',
    status: 'approved',
  });

  // Mark items recovered + stats
  lostLaptop.status = 'recovered';
  foundLaptop.status = 'recovered';
  await lostLaptop.save();
  await foundLaptop.save();

  finder.stats.itemsReturned += 1;
  finder.stats.trustScore = Math.min(100, finder.stats.trustScore + 5);
  await finder.save();
  owner.stats.itemsRecovered += 1;
  await owner.save();

  // Reward for the finder
  const reward = await Reward.create({
    user: finder._id,
    triggeredByMatch: match._id,
    resources: [
      { title: 'UX Design Roadmap', type: 'roadmap', url: 'https://roadmap.sh/ux-design', reason: 'Matches your interest in UX design.' },
      { title: 'Web Accessibility Guide (MDN)', type: 'docs', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility', reason: 'Deepen your accessibility knowledge.' },
      { title: 'Career Growth for Staff Roles', type: 'career', url: 'https://www.levels.fyi', reason: 'Career development resources.' },
    ],
  });

  // Notifications
  await Notification.create([
    {
      user: owner._id, type: 'recovery_complete', title: 'Item recovered 🎉',
      body: 'Your Dell XPS 13 laptop has been verified and recovered.',
      data: { matchId: match._id.toString() }, read: false,
    },
    {
      user: finder._id, type: 'reward_earned', title: 'You earned a learning reward 🎓',
      body: 'Thanks for your honesty! We picked resources tailored to your interests.',
      data: { rewardId: reward._id.toString() }, read: false,
    },
  ]);

  console.log('\n✅ Seed complete!');
  console.log('Demo users (dev-auth uid / email):');
  console.log('  admin     : dev-admin    / admin@lokii.dev');
  console.log('  security  : dev-security / security@lokii.dev');
  console.log('  student   : dev-alice    / alice@lokii.dev  (owner in demo flow)');
  console.log('  staff     : dev-dave     / dave@lokii.dev   (finder in demo flow)');
  console.log('  student   : dev-bob      / bob@lokii.dev');
  console.log('  faculty   : dev-carol    / carol@lokii.dev');
  console.log(`\nItems: ${lostItems.length} lost, ${foundItems.length} found.`);
  console.log('One completed recovery + reward created.\n');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Seed failed:', err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
