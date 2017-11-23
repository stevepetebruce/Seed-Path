/*
  data and helper functions that to expose and use in templating function
*/

// FS - built in module to node that let's us read files from the system we're running on
const fs = require('fs');

// Select current month on sow routing
const moment = require('moment');
const monthNow = moment().format("MMM");

// moment.js is a handy library for displaying dates. We need this in our templates to display things like "Posted 5 minutes ago"
exports.moment = require('moment');

// Dump is a handy debugging function we can use to sort of "console.log" our data
exports.dump = (obj) => JSON.stringify(obj, null, 2);

// Making a static map is really long - this is a handy helper function to make one
exports.staticMap = ([lng, lat]) => `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=800x150&key=${process.env.MAP_KEY}&markers=${lat},${lng}&scale=2`;

// inserting an SVG
exports.icon = (name) => fs.readFileSync(`./public/images/icons/${name}.svg`);

// Some details about the site
exports.siteName = `SeedPath - When to sow and harvest your vegetables`;



exports.menu = [
  { slug: '/stores', title: 'Veg', icon: 'store', },
  { slug: `/sowing/${monthNow}`, title: 'Sow', icon: 'tag', },
  { slug: '/harvesting', title: 'Harvest', icon: 'tag', },
  { slug: '/top', title: 'Top', icon: 'top', },
  { slug: '/add', title: 'Add', icon: 'add', },
  { slug: '/map', title: 'Map', icon: 'map', },
];
