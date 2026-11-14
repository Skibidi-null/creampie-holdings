// All the app wording in one place. Plain and simple.
export const T = {
  app: 'Creampie Holdings',
  tagline: 'Personal money tracker',
  hello: ['Welcome back', 'Hello again', 'Good to see you'],

  // nav
  nHome: 'Home', nActivity: 'Activity', nGold: 'Gold', nWealth: 'Wealth', nAdd: 'Add',

  // add
  addExp: 'Add expense', addExpHint: 'Add expense',
  addInc: 'Add income', addIncHint: 'Add income',
  addXfer: 'Move money', addXferHint: 'Move between accounts',
  addSplit: 'Split a bill', addSplitHint: 'Split with a friend',
  addFriend: 'Lend / borrow', addFriendHint: 'Lend / borrow money',

  // home
  todayLeft: 'You can spend today',
  todayOver: 'Over today\'s limit by',
  noBudget: 'Set a monthly limit to get a daily allowance',
  spentToday: 'Spent today',
  thisMonth: 'Spent this month',
  netWorth: 'Net worth', netWorthHint: 'Net worth',
  empty: 'Nothing here yet.',

  // sections
  card: 'Credit card', cardHint: 'Limit, spending & bill',
  accounts: 'Accounts', accountsHint: 'Bank & cash',
  friends: 'Friends & debts', friendsHint: 'Who owes who',
  goals: 'Savings goals', goalsHint: 'Savings goals',
  zakat: 'Zakat', zakatHint: 'Calculator',
  bills: 'Regular bills', billsHint: 'Repeat payments',
  budget: 'Budgets', budgetHint: 'Budgets',
  news: 'Gold news', newsHint: 'Gold news',
  history: 'History', historyHint: 'Monthly history',
  convert: 'Currency converter', convertHint: 'Currency converter',
  summary: 'Month summary', summaryHint: 'Month summary',
  settings: 'Settings', settingsHint: 'Settings',
  backup: 'Backup', backupHint: 'Backup & export',

  // gold
  goldLive: 'Live price per gram',
  buyGood: 'Price is low. Good time to buy',
  buyOk: 'Fair price. Buying a little is fine',
  buyWait: 'Price is high. Maybe wait',
  boughtGold: 'Add gold purchase', boughtGoldHint: 'Log a purchase',

  // privacy / lock
  discreet: 'Hide amounts', discreetHint: 'Blur all amounts on screen',
  members: 'PIN lock',
  pinAsk: 'Enter your PIN',
  pinWrong: 'Wrong PIN. Try again',

  // alerts
  cardWarn80: 'Credit card is 80% used',
  catWarn: (n) => `${n}: 80% of your limit used`,
  catOver: (n) => `${n}: over your monthly limit`,
};

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
