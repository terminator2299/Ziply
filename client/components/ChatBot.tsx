"use client";

import { useState, useEffect } from 'react';
import styles from './ChatBot.module.css';

const FAQS = [
  {
    question: "What's special in Ziply?",
    answer: "Ziply processes all files locally in your browser. No uploads, no privacy worries!"
  },
  {
    question: "Who developed Ziply?",
    answer: "Ziply was developed by Bhavya Khandelwal."
  },
  {
    question: "What are the tech stacks of this website?",
    answer: "Ziply uses Next.js (React), Tailwind CSS, and serverless technologies."
  }
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('ziplyBotAutoOpened')) {
      setOpen(true);
      sessionStorage.setItem('ziplyBotAutoOpened', '1');
    }
  }, []);

  return (
    <div>
      <button className={styles.fab} onClick={() => setOpen(!open)} aria-label="Open chat bot">
        💬
      </button>
      {open && (
        <div className={styles.chatWindow}>
          <div className={styles.header}>Ask Ziply Bot</div>
          <div className={styles.suggestions}>
            {FAQS.map((faq, idx) => (
              <button key={idx} onClick={() => setSelected(idx)} className={styles.suggestionBtn}>
                {faq.question}
              </button>
            ))}
          </div>
          <div className={styles.answer}>
            {selected !== null && <p>{FAQS[selected].answer}</p>}
          </div>
          <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close chat bot">×</button>
        </div>
      )}
    </div>
  );
} 