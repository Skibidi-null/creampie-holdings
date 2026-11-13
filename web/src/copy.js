// All the cheeky wording in one place. Every label keeps a plain hint so it stays usable.
export const T = {
  app: 'Creampie Holdings',
  tagline: 'Strictly adults. Strictly money.',
  hello: ['Welcome back, big spender 😈', 'Back for more? 😏', 'Daddy\'s home 💸', 'Ready to get filthy rich? 🍑', 'Look who came back 💦'],

  // nav
  nHome: 'Lounge', nActivity: 'Dirty Laundry', nGold: 'Gold Digger', nWealth: 'The Stash', nAdd: 'Blow',

  // add
  addExp: 'Blow some cash', addExpHint: 'Add expense',
  addInc: 'Money shot 💦', addIncHint: 'Add income',
  addXfer: 'Switch positions', addXferHint: 'Move between accounts',
  addSplit: 'Go Dutch', addSplitHint: 'Split with a friend',
  addFriend: 'Favours', addFriendHint: 'Lend / borrow money',

  // home
  todayLeft: 'You can still blow today',
  todayOver: 'You went all the way. Over today by',
  noBudget: 'Set a monthly limit so I know how far you can go',
  spentToday: 'Blown today',
  thisMonth: 'This month',
  netWorth: 'Total package', netWorthHint: 'Net worth',
  empty: 'Nothing in here yet. Put it in 😉',

  // sections
  card: 'Plastic Daddy', cardHint: 'Credit card',
  accounts: 'Cash Stash', accountsHint: 'Bank & cash',
  friends: 'Favours Owed', friendsHint: 'Friends & debts',
  goals: 'Saving It For Later', goalsHint: 'Savings goals',
  zakat: 'Zakat', zakatHint: 'Purify the stash',
  bills: 'Regular Bills', billsHint: 'Repeat payments',
  budget: 'Limits & Safe Words', budgetHint: 'Budgets',
  news: 'Hot Gossip', newsHint: 'Gold news',
  history: 'Past Encounters', historyHint: 'Monthly history',
  convert: 'Exchange Fluids', convertHint: 'Currency converter',
  summary: 'Morning After', summaryHint: 'Month summary',
  settings: 'Kinks & Settings', settingsHint: 'Settings',
  backup: 'Protection', backupHint: 'Backup & export',

  // gold
  goldLive: 'Gold, live & throbbing',
  buyGood: 'Gold is going down 🍆. Good time to buy',
  buyOk: 'Fair price. A quickie buy is fine',
  buyWait: 'Pricey. Keep it in your pants for now',
  boughtGold: 'Got some gold', boughtGoldHint: 'Log a purchase',

  // privacy / lock
  discreet: 'Discreet mode', discreetHint: 'Hide all amounts',
  members: 'Members only 🔞',
  pinAsk: 'Show me your PIN 😏',
  pinWrong: 'Wrong. Try harder 😈',

  // alerts
  cardWarn80: 'Easy tiger, Plastic Daddy is 80% maxed',
  catWarn: (n) => `Getting too hot on ${n}. 80% of your limit`,
  catOver: (n) => `You blew past your ${n} limit 💦`,
};

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
