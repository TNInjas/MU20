/**
 * Warren Buffett Quotes
 * Random quotes for the dashboard subtitle
 */

export const WARREN_BUFFETT_QUOTES = [
  {
    text: "Price is what you pay. Value is what you get.",
    author: "Warren Buffett",
  },
  {
    text: "Honesty is a very expensive gift, Don't expect it from cheap people.",
    author: "Warren Buffett",
  },
  {
    text: "Someone's sitting in the shade today because someone planted a tree a long time ago.",
    author: "Warren Buffett",
  },
  {
    text: "Be Fearful When Others Are Greedy and Greedy When Others Are Fearful",
    author: "Warren Buffett",
  },
  {
    text: "If you're in the luckiest one per cent of humanity, you owe it to the rest of humanity to think about the other 99 per cent.",
    author: "Warren Buffett",
  },
  {
    text: "The most important thing to do if you find yourself in a hole is to stop digging.",
    author: "Warren Buffett",
  },
  {
    text: "Risk comes from not knowing what you're doing",
    author: "Warren Buffett",
  },
  {
    text: "The difference between successful people and really successful people is that really successful people say no to almost everything.",
    author: "Warren Buffett",
  },
  {
    text: "No matter how great the talent or efforts, some things just take time. You can't produce a baby in one month by getting nine women pregnant.",
    author: "Warren Buffett",
  },
  {
    text: "Should you find yourself in a chronically leaking boat, energy devoted to changing vessels is likely to be more productive than energy devoted to patching leaks.",
    author: "Warren Buffet",
  },
  {
    text: "It takes 20 years to build a reputation and five minuted to ruin it. If you think about that you'll do things differently.",
    author: "Warren Buffett",
  },
  {
    text: "There's class warfare, all right, but it's my class, the rich class, that's making war, and we're winning.",
    author: "Warren Buffett",
  },
  {
    text: "Rule No. 1 : Never lose money. Rule No. 2 : Never forget Rule No. 1.",
    author: "Warren Buffett",
  },
  {
    text: "It's better to hang out with people better than you. Pick out associates whose behavior is better than yours and you'll drift in that direction.",
    author: "Warren Buffett",
  },
  {
    text: "There seems to be some perverse human characteristic that likes to make easy things difficult.",
    author: "Warren Buffett",
  },
  {
    text: "You only have to do a very few things right in your life so long as you don't do too many things wrong.",
    author: "Warren Buffett",
  },
  {
    text: "You never know who's swimming naked until the tide goes out.",
    author: "Warren Buffett",
  },
  {
    text: "You can't produce a baby in one month by getting nine women pregnant.",
    author: "Warren Buffett",
  },
  {
    text: "Never ask a barber if you need a haircut.",
    author: "Warren Buffett",
  },
  {
    text: "In the world of business, the people who are most successful are those who are doing what they love.",
    author: "Warren Buffet",
  },
  {
    text: "What the wise do in the beginning, fools do in the end.",
    author: "Warren Buffett",
  },
];

export function getRandomQuote() {
  return WARREN_BUFFETT_QUOTES[
    Math.floor(Math.random() * WARREN_BUFFETT_QUOTES.length)
  ];
}


