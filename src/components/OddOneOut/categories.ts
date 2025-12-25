export interface Category {
  name: string;
  words: string[];
  hint?: string;
  wordCount?: number;
  isPro?: boolean;
}

export const PRESET_CATEGORIES: Category[] = [
  { 
    name: 'Christmas', 
    words: ['santa', 'reindeer', 'snowman', 'presents', 'tree', 'ornament', 'sleigh', 'elf', 'mistletoe', 'wreath', 'stocking', 'gingerbread', 'carol', 'bells', 'holly', 'candy cane', 'chimney', 'fireplace', 'angel', 'star', 'tinsel', 'garland', 'nutcracker', 'eggnog', 'fruitcake', 'turkey', 'ham', 'cookies', 'milk', 'north pole', 'workshop', 'toy', 'gift', 'bow', 'ribbon', 'snow', 'ice', 'cold', 'winter', 'december', 'holiday', 'festive', 'merry', 'jolly', 'cheer', 'family', 'tradition', 'celebration', 'nativity', 'bethlehem', 'magi', 'shepherd', 'stable', 'manger', 'star of bethlehem', 'frankincense', 'myrrh', 'gold', 'advent', 'wreath', 'candle', 'christmas eve', 'christmas day', 'boxing day', 'new year'],
    hint: 'A winter holiday',
    wordCount: 67
  },
  { 
    name: 'Animals', 
    words: ['elephant', 'giraffe', 'penguin', 'dolphin', 'tiger', 'koala', 'zebra', 'kangaroo', 'lion', 'bear', 'wolf', 'fox', 'deer', 'moose', 'rabbit', 'squirrel', 'chipmunk', 'beaver', 'otter', 'seal', 'walrus', 'whale', 'shark', 'octopus', 'jellyfish', 'starfish', 'crab', 'lobster', 'shrimp', 'turtle', 'crocodile', 'alligator', 'snake', 'lizard', 'frog', 'toad', 'salamander', 'eagle', 'hawk', 'owl', 'parrot', 'peacock', 'flamingo', 'swan', 'duck', 'goose', 'chicken', 'rooster', 'turkey', 'ostrich', 'emu', 'kiwi', 'panda', 'gorilla', 'chimpanzee', 'orangutan', 'monkey', 'lemur', 'sloth', 'armadillo', 'anteater', 'platypus', 'echidna', 'wombat', 'tasmanian devil', 'dingo', 'hyena', 'cheetah', 'leopard', 'jaguar', 'puma', 'lynx', 'bobcat', 'cougar', 'panther', 'caracal', 'serval', 'ocelot', 'margay', 'jaguarundi', 'camel', 'llama', 'alpaca', 'vicuna', 'guanaco', 'bison', 'buffalo', 'yak', 'ox'],
    hint: 'A living creature',
    wordCount: 90
  },
  { 
    name: 'Food', 
    words: ['pizza', 'sushi', 'burger', 'pasta', 'tacos', 'salad', 'curry', 'sandwich', 'steak', 'chicken', 'fish', 'shrimp', 'lobster', 'crab', 'oyster', 'clam', 'mussel', 'scallop', 'squid', 'octopus', 'rice', 'noodles', 'bread', 'toast', 'bagel', 'croissant', 'muffin', 'donut', 'cake', 'pie', 'cookie', 'brownie', 'cupcake', 'ice cream', 'sorbet', 'gelato', 'frozen yogurt', 'milkshake', 'smoothie', 'juice', 'soda', 'coffee', 'tea', 'latte', 'cappuccino', 'espresso', 'mocha', 'hot chocolate', 'soup', 'stew', 'chili', 'ramen', 'pho', 'udon', 'soba', 'pad thai', 'fried rice', 'lo mein', 'chow mein', 'spring roll', 'dumpling', 'wonton', 'bao', 'dim sum', 'tempura', 'teriyaki', 'yakitori', 'sashimi', 'nigiri', 'maki'],
    hint: 'Something you eat',
    wordCount: 70
  },
  { 
    name: 'Objects', 
    words: ['phone', 'laptop', 'tablet', 'computer', 'keyboard', 'mouse', 'monitor', 'speaker', 'headphones', 'charger', 'cable', 'remote', 'television', 'radio', 'camera', 'watch', 'clock', 'lamp', 'fan', 'heater', 'air conditioner', 'refrigerator', 'microwave', 'oven', 'stove', 'dishwasher', 'washing machine', 'dryer', 'vacuum', 'broom', 'mop', 'bucket', 'sponge', 'towel', 'soap', 'shampoo', 'toothbrush', 'toothpaste', 'comb', 'brush', 'mirror', 'scissors', 'knife', 'fork', 'spoon', 'plate', 'bowl', 'cup', 'glass', 'bottle', 'can', 'jar', 'box', 'bag', 'backpack', 'suitcase', 'wallet', 'purse', 'keys', 'lock', 'door', 'window', 'curtain', 'blinds', 'rug', 'carpet', 'pillow', 'blanket', 'sheet', 'mattress', 'bed', 'couch', 'chair', 'table', 'desk', 'shelf', 'cabinet', 'drawer', 'closet', 'hanger', 'book', 'pen', 'pencil', 'eraser', 'ruler', 'stapler', 'tape', 'glue', 'paper', 'notebook', 'folder', 'binder', 'envelope', 'stamp', 'postcard', 'letter', 'package', 'box'],
    hint: 'A thing you can touch',
    wordCount: 100
  },
  { 
    name: 'Movies', 
    words: ['avatar', 'titanic', 'star wars', 'avengers', 'jurassic park', 'lion king', 'frozen', 'toy story', 'finding nemo', 'shrek', 'harry potter', 'lord of the rings', 'matrix', 'inception', 'interstellar', 'gladiator', 'forrest gump', 'pulp fiction', 'godfather', 'dark knight', 'spider-man', 'iron man', 'thor', 'captain america', 'black panther', 'wonder woman', 'superman', 'batman', 'joker', 'deadpool', 'wolverine', 'x-men', 'transformers', 'fast and furious', 'mission impossible', 'james bond', 'indiana jones', 'pirates of caribbean', 'back to the future', 'terminator', 'alien', 'predator', 'jaws', 'e.t.', 'ghostbusters', 'men in black', 'independence day', 'armageddon', 'deep impact', 'twister'],
    hint: 'A film you watch',
    wordCount: 50
  },
  { 
    name: 'Locations', 
    words: ['paris', 'london', 'tokyo', 'new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'jacksonville', 'fort worth', 'columbus', 'charlotte', 'san francisco', 'indianapolis', 'seattle', 'denver', 'washington', 'boston', 'nashville', 'baltimore', 'oklahoma city', 'portland', 'las vegas', 'detroit', 'memphis', 'louisville', 'milwaukee', 'albuquerque', 'tucson', 'fresno', 'sacramento', 'kansas city', 'mesa', 'atlanta', 'omaha', 'colorado springs', 'raleigh', 'miami', 'oakland', 'minneapolis', 'tulsa', 'wichita', 'new orleans', 'arlington', 'cleveland', 'bakersfield', 'tampa', 'aurora', 'honolulu', 'anaheim', 'santa ana', 'corpus christi', 'riverside', 'st. louis', 'lexington', 'pittsburgh', 'anchorage', 'stockton', 'cincinnati', 'saint paul', 'toledo', 'newark', 'greensboro', 'plano', 'henderson', 'lincoln', 'buffalo', 'fort wayne', 'jersey city', 'chula vista', 'orlando', 'norfolk', 'chandler', 'laredo'],
    hint: 'A place on Earth',
    wordCount: 80
  },
  { 
    name: 'Sports', 
    words: ['soccer', 'basketball', 'tennis', 'swimming', 'hockey', 'volleyball', 'baseball', 'golf', 'badminton', 'table tennis', 'cricket', 'rugby', 'football', 'boxing', 'wrestling', 'martial arts', 'karate', 'judo', 'taekwondo', 'kung fu', 'skiing', 'snowboarding', 'ice skating', 'figure skating', 'speed skating', 'curling', 'bobsled', 'luge', 'skeleton', 'biathlon', 'cross country skiing', 'alpine skiing', 'freestyle skiing', 'ski jumping', 'snowmobiling', 'surfing', 'windsurfing', 'kitesurfing', 'wakeboarding', 'water skiing', 'jet skiing', 'kayaking', 'canoeing', 'rowing', 'sailing', 'yachting', 'fishing', 'diving', 'snorkeling', 'scuba diving', 'rock climbing', 'bouldering', 'mountaineering', 'hiking', 'trail running', 'marathon', 'triathlon', 'cycling', 'bmx', 'mountain biking'],
    hint: 'A physical activity',
    wordCount: 60
  },
  { 
    name: 'Professions', 
    words: ['doctor', 'nurse', 'teacher', 'engineer', 'lawyer', 'accountant', 'architect', 'designer', 'developer', 'programmer', 'analyst', 'manager', 'director', 'executive', 'consultant', 'advisor', 'coach', 'trainer', 'instructor', 'professor', 'researcher', 'scientist', 'chemist', 'physicist', 'biologist', 'geologist', 'astronomer', 'meteorologist', 'pharmacist', 'dentist', 'veterinarian', 'surgeon', 'therapist', 'psychologist', 'psychiatrist', 'counselor', 'social worker', 'paramedic', 'firefighter', 'police officer', 'detective', 'soldier', 'pilot', 'flight attendant', 'captain', 'sailor', 'chef', 'cook', 'baker', 'bartender', 'waiter', 'waitress', 'cashier', 'salesperson', 'clerk', 'receptionist', 'secretary', 'assistant', 'administrator', 'coordinator', 'supervisor', 'foreman', 'technician', 'mechanic', 'electrician', 'plumber', 'carpenter', 'mason', 'painter', 'roofer', 'landscaper', 'gardener', 'farmer', 'rancher', 'fisherman', 'miner', 'logger', 'driver', 'trucker', 'delivery person', 'courier'],
    hint: 'A job or career',
    wordCount: 80,
    isPro: true
  },
  { 
    name: 'Brands', 
    words: ['apple', 'google', 'microsoft', 'amazon', 'facebook', 'tesla', 'nike', 'adidas', 'puma', 'reebok', 'under armour', 'coca cola', 'pepsi', 'sprite', 'fanta', 'mountain dew', 'dr pepper', 'starbucks', 'dunkin', 'mcdonalds', 'burger king', 'wendys', 'subway', 'kfc', 'taco bell', 'pizza hut', 'dominos', 'papa johns', 'chipotle', 'panera', 'chick fil a', 'five guys', 'in n out', 'shake shack', 'sonic', 'arbys', 'popeyes', 'jack in the box', 'white castle', 'hardees', 'carls jr', 'dairy queen', 'baskin robbins', 'ben and jerrys', 'haagen dazs', 'breyers', 'blue bell', 'talenti', 'magnum', 'klondike', 'popsicle', 'good humor', 'nestle', 'hersheys', 'mars', 'cadbury', 'lindt', 'godiva', 'ferrero rocher', 'toblerone', 'kit kat', 'snickers', 'twix', 'milky way'],
    hint: 'A company name',
    wordCount: 65,
    isPro: true
  }
];

