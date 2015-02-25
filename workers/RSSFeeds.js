

//remember feed names have to be under 35 characters for schema

//NEED A SYSTEM FOR MAKING SURE 

module.exports.feeds = [{
  url: 'http://www.sfgate.com/bayarea/feed/Bay-Area-News-429.php',
  name: 'Bay Area News',
  location: 'World/United States/California/San Francisco',
  channel: 'All/News'
},{
  url: 'http://www.sfgate.com/rss/feed/Food-Dining-550.php',
  name: 'SF FoodBot',
  location: 'World/United States/California/San Francisco',
  channel: 'All/Food'
},{
  url: 'http://old.seattletimes.com/rss/home.xml',
  name: 'Seattle Times',
  location: 'World/United States/Washington/Seattle',
  channel: 'All/News'
},{
  url: 'http://topics.oregonlive.com/tag/portland%20city%20hall/atom.xml',
  name: 'Portland City Hall Watch',
  location: 'World/United States/Oregon/Portland',
  channel: 'All/News'
},{
  url: '',
  name: '',
  location: '',
  channel: ''
},{
  url: '',
  name: '',
  location: '',
  channel: ''
}];