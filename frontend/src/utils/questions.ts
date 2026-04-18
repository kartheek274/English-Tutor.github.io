import AsyncStorage from '@react-native-async-storage/async-storage';

export type Question = {
  te: string;
  en: string[];
  hint: string;
  topic: string;
};

export type PdfBank = {
  name: string;
  topic: string;
  questions: Question[];
};

const USER_KEY = 'eq_user_questions';
const PDF_KEY = 'eq_pdf_banks';

export async function loadUserQuestions(): Promise<Question[]> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveUserQuestions(qs: Question[]): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(qs));
}

export async function loadPdfBanks(): Promise<PdfBank[]> {
  try {
    const raw = await AsyncStorage.getItem(PDF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function savePdfBanks(banks: PdfBank[]): Promise<void> {
  await AsyncStorage.setItem(PDF_KEY, JSON.stringify(banks));
}

// Normalization for answer checking
export function norm(s: string): string {
  const contractions: Record<string, string> = {
    "i'm": 'i am',
    "she's": 'she is',
    "he's": 'he is',
    "they're": 'they are',
    "we're": 'we are',
    "you're": 'you are',
    "it's": 'it is',
    "i'll": 'i will',
    "she'll": 'she will',
    "he'll": 'he will',
    "they'll": 'they will',
    "we'll": 'we will',
    "i've": 'i have',
    "don't": 'do not',
    "doesn't": 'does not',
    "didn't": 'did not',
    "isn't": 'is not',
    "aren't": 'are not',
    "wasn't": 'was not',
    "weren't": 'were not',
    "can't": 'cannot',
    "won't": 'will not',
    "shouldn't": 'should not',
    "wouldn't": 'would not',
    "couldn't": 'could not',
    "that's": 'that is',
    "there's": 'there is',
    "what's": 'what is',
    "where's": 'where is',
    "who's": 'who is',
    "how's": 'how is',
    "let's": 'let us',
  };

  let out = s.toLowerCase();
  // Strip punctuation except apostrophes
  out = out.replace(/[^\w\s']/g, ' ');
  // Expand contractions
  Object.entries(contractions).forEach(([k, v]) => {
    out = out.split(k).join(v);
  });
  // Remove any stray apostrophes
  out = out.replace(/'/g, '');
  // Collapse whitespace
  out = out.replace(/\s+/g, ' ').trim();
  return out;
}

function stripArticles(s: string): string {
  const words = s.split(' ');
  while (words.length && /^(a|an|the)$/.test(words[0])) words.shift();
  while (words.length && /^(a|an|the)$/.test(words[words.length - 1])) words.pop();
  return words.join(' ');
}

export function checkAns(userInput: string, q: Question): boolean {
  const u = norm(userInput);
  if (!u) return false;
  for (const a of q.en) {
    const na = norm(a);
    if (u === na) return true;
    if (stripArticles(u) === stripArticles(na)) return true;
  }
  return false;
}

export function buildPool(userQs: Question[], banks: PdfBank[], syllabus: string): Question[] {
  const bankQs = banks.flatMap(b => b.questions);
  let all = [...userQs, ...bankQs];
  if (syllabus !== 'all') {
    all = all.filter(q => q.topic === syllabus);
  }
  return all.slice().sort(() => Math.random() - 0.5);
}

export function sanitizeTopicKey(filename: string): string {
  return (
    'pdf_' +
    filename
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40)
  );
}
