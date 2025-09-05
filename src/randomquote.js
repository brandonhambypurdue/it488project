import React, { useEffect, useState } from 'react';
import axios from 'axios';

const QUOTES = [
  "Nothing is impossible, the word itself says ‘I’m possible.’ — Audrey Hepburn",
  "The secret of getting ahead is getting started. ~ Mark Twain",
  "The harder the battle, the sweeter the victory. ~ Les Brown",
  "Believe you can and you’re halfway there. ~ Theodore Roosevelt",
  "Do what you have to do until you can do what you want to do. ~ Oprah Winfrey",
  "Tough times don't last. Tough people do. ~ Robert H. Schuller",
  "It does not matter how slowly you go as long as you do not stop. ~ Confucius",
  "Everything you’ve ever wanted is on the other side of fear. ~ George Addair",
  "Pain is temporary. Quitting lasts forever. ~ Lance Armstrong",
  "Hard times don’t create heroes. It is during the hard times when the ‘hero’ within us is revealed ~ Bob Riley",
  "Difficult roads always lead to beautiful destinations. ~ Zig iglar",
  "Your time is limited, so don’t waste it living someone else’s life. ~ Steve Jobs",
  "Perseverance is failing 19 times and succeeding the 20th. ~ Julie Andrews",
  "You cannot fail at being yourself. ~ Wayner Dyer",
  "If you cannot do great things, do small things in a great way. ~ Napoleon Hill",
];

export default function RandomQuote() {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const idx = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[idx]);
  }, []);



  return <span className="weekDayFlexArea">{quote}</span>;
}