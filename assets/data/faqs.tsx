export interface FAQ {
  key: string; // Unique ID for the FAQ
  questionKey: string; // i18n key for the question
  answerKey: string;   // i18n key for the answer
}

export const FAQs: FAQ[] = [
  {
    key: 'faq_1',
    questionKey: 'faq_1_question',
    answerKey: 'faq_1_answer',
  },
  {
    key: 'faq_2',
    questionKey: 'faq_2_question',
    answerKey: 'faq_2_answer',
  },
];
