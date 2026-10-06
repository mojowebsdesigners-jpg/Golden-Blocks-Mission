import type { Faq } from '@/types'

/**
 * Starter FAQs. The same questions are inserted by supabase/seed.sql so they can be edited in
 * Admin → FAQs; this copy is only shown when the backend is not connected. Keep the two in sync.
 * Answers describe how the website actually works. Anything only the organisation can confirm
 * is marked "to be confirmed" rather than guessed.
 */
const rows: [category: string, question: string, answer: string][] = [
  ['About us', 'What is Golden Blocks Mission?',
    'A nonprofit Christian organisation that builds and renovates churches and supports the Gospel, working with the Seventh-day Adventist Church in the North East Kenya Field.'],
  ['About us', 'What does the name “Golden Blocks” mean?',
    'Gold is our finest, freely offered to God. Blocks are the material of His house.'],
  ['Giving', 'How can I give?',
    'On the Donate page: M-Pesa, Visa or Mastercard, or bank transfer.'],
  ['Giving', 'Is giving online secure?',
    'Yes. Cards are processed by Paystack, and each gift is confirmed by the payment provider before it is recorded.'],
  ['Giving', 'Can I choose what my gift supports?',
    'Yes. Choose an area of work or a specific project when you give.'],
  ['Giving', 'Can I give every month?',
    'Yes, by card. M-Pesa gifts are one-time.'],
  ['Giving', 'Will I receive a receipt?',
    'You get a confirmation email once your payment is verified. Official receipts: to be confirmed.'],
  ['Getting involved', 'How else can I help besides giving money?',
    'Give materials, volunteer, offer professional skills, fundraise or pray. See Get Involved.'],
  ['Getting involved', 'Can my church or business partner with you?',
    'Yes. Send a partnership enquiry and our team will reply.'],
  ['Getting involved', 'How does sponsorship work?',
    'Choose a programme on the Sponsorship page and send an enquiry.'],
  ['Projects', 'How can I follow a project’s progress?',
    'Each project page has photos and progress updates.'],
  ['Contact', 'How do I contact the team?',
    'Use the form on the Contact page.'],
]

export const LOCAL_FAQS: Faq[] = rows.map(([category, question, answer], i) => ({
  id: `local-faq-${i + 1}`,
  category,
  question,
  answer,
  display_order: i + 1,
  published: true,
  created_at: '2026-10-05T00:00:00Z',
  updated_at: '2026-10-05T00:00:00Z',
}))
