import { createClient } from '@supabase/supabase-js';
import { hasFullAccessTier } from '../businesscases/access.js';
import { IDIOM_LESSONS } from '../idioms/catalog.js';

// Server-only lesson content, preserved verbatim from the approved prototype.
export const IDIOM_LESSON_CONTENT = {
  "1": [
    {
      "id": 1,
      "idiom": "Break the ice",
      "options": [
        "To start a conversation and ease tension",
        "To stop an argument immediately",
        "To reveal a secret by accident",
        "To make someone feel unwelcome"
      ],
      "correct": 0,
      "examples": [
        "The host told a funny story to break the ice.",
        "A quick game helped break the ice on the first day.",
        "I asked about her weekend to break the ice.",
        "Small talk can break the ice before a meeting."
      ],
      "spanish": "Romper el hielo"
    },
    {
      "id": 2,
      "idiom": "Hit the nail on the head",
      "options": [
        "To finish a task ahead of schedule",
        "To describe something exactly right",
        "To make an expensive mistake",
        "To work very hard without results"
      ],
      "correct": 1,
      "examples": [
        "You hit the nail on the head with that explanation.",
        "Her comment really hit the nail on the head.",
        "The article hits the nail on the head about remote work.",
        "I think you’ve hit the nail on the head: we need more time."
      ],
      "spanish": "Dar en el clavo"
    },
    {
      "id": 3,
      "idiom": "Under the weather",
      "options": [
        "Excited about a new opportunity",
        "Confused about the instructions",
        "Feeling slightly ill or unwell",
        "Unable to afford something"
      ],
      "correct": 2,
      "examples": [
        "I’m feeling a bit under the weather today.",
        "She stayed home because she was under the weather.",
        "He sounded under the weather on the phone.",
        "If you’re under the weather, get some rest."
      ],
      "spanish": "Sentirse indispuesto / sentirse un poco mal"
    },
    {
      "id": 4,
      "idiom": "Cost an arm and a leg",
      "options": [
        "Require lots of physical effort",
        "Take several years to finish",
        "Be difficult to find",
        "Be extremely expensive"
      ],
      "correct": 3,
      "examples": [
        "That designer sofa costs an arm and a leg.",
        "Flights during the holidays can cost an arm and a leg.",
        "Their wedding must have cost an arm and a leg.",
        "I love the jacket, but it costs an arm and a leg."
      ],
      "spanish": "Costar un ojo de la cara"
    },
    {
      "id": 5,
      "idiom": "The ball is in your court",
      "options": [
        "You have to make the next decision or move",
        "You are responsible for a past failure",
        "You have already won the argument",
        "You should stop working for the day"
      ],
      "correct": 0,
      "examples": [
        "I’ve sent the proposal, so the ball is in your court.",
        "We made our offer; now the ball is in their court.",
        "The ball is in your court if you want to continue.",
        "I answered all his questions. The ball is in his court."
      ],
      "spanish": "La pelota está en tu cancha / ahora te toca a ti"
    },
    {
      "id": 6,
      "idiom": "Once in a blue moon",
      "options": [
        "Without any warning",
        "Very rarely",
        "For a very long time",
        "At exactly the right moment"
      ],
      "correct": 1,
      "examples": [
        "We only eat at that restaurant once in a blue moon.",
        "He visits his hometown once in a blue moon.",
        "I buy a lottery ticket once in a blue moon.",
        "It snows here once in a blue moon."
      ],
      "spanish": "De Pascuas a Ramos / muy de vez en cuando"
    },
    {
      "id": 7,
      "idiom": "Spill the beans",
      "options": [
        "Change your mind about a plan",
        "Complain about something unfair",
        "Reveal a secret or surprise",
        "Give someone helpful advice"
      ],
      "correct": 2,
      "examples": [
        "Don’t spill the beans about the surprise party!",
        "Who spilled the beans about the promotion?",
        "She accidentally spilled the beans before the announcement.",
        "I almost spilled the beans, but I stopped myself."
      ],
      "spanish": "Irse de la lengua / soltar la sopa"
    },
    {
      "id": 8,
      "idiom": "Bite the bullet",
      "options": [
        "Make a decision without thinking",
        "Ignore advice from others",
        "Give up after several attempts",
        "Face something difficult or unpleasant"
      ],
      "correct": 3,
      "examples": [
        "I finally bit the bullet and went to the dentist.",
        "We had to bite the bullet and pay for repairs.",
        "She bit the bullet and had the difficult conversation.",
        "It’s time to bite the bullet and start studying."
      ],
      "spanish": "Hacer de tripas corazón / armarse de valor"
    },
    {
      "id": 9,
      "idiom": "On the same page",
      "options": [
        "Sharing the same understanding or agreement",
        "Reading the exact same book",
        "Being equally skilled at something",
        "Following the same daily routine"
      ],
      "correct": 0,
      "examples": [
        "Let’s make sure we’re on the same page before we begin.",
        "The team isn’t on the same page about the deadline.",
        "Are we on the same page regarding the budget?",
        "A short meeting will help everyone get on the same page."
      ],
      "spanish": "Estar en sintonía / estar de acuerdo"
    },
    {
      "id": 10,
      "idiom": "Call it a day",
      "options": [
        "Cancel a project permanently",
        "Stop working for now",
        "Celebrate a major achievement",
        "Start again from the beginning"
      ],
      "correct": 1,
      "examples": [
        "We’ve done enough work; let’s call it a day.",
        "After three hours of studying, I called it a day.",
        "It’s getting late, so we should call it a day.",
        "Let’s finish this last task and call it a day."
      ],
      "spanish": "Dar por terminado el día / dejarlo por hoy"
    }
  ]
};

function preventCaching(res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('Vary', 'Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

export function createIdiomsHandler({ supabase }) {
  return async (req, res) => {
    preventCaching(res);
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const authorization = req.headers?.authorization;
    const token = typeof authorization === 'string' ? authorization.match(/^Bearer ([^\s]+)$/i)?.[1] : null;
    if (!token) return res.status(401).json({ error: 'Please sign in to access Idioms Lessons.' });

    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user?.id) {
        return res.status(error?.status >= 500 ? 503 : 401).json({ error: 'Your account could not be verified. Please sign in again.' });
      }
      const { data: profile, error: profileError } = await supabase
        .from('profiles').select('tier,is_admin').eq('id', data.user.id).maybeSingle();
      if (profileError) return res.status(503).json({ error: 'Access could not be checked. Please try again.' });

      // Stripe's existing webhook/confirm-payment flow maintains profiles.tier.
      // Reuse the platform's full-access tiers, including staff/student grants.
      const tier = profile?.is_admin === true ? 'admin' : profile?.tier;
      const plusAccess = hasFullAccessTier(tier);
      const rawId = req.query?.lesson;
      if (rawId === undefined) {
        return res.status(200).json({ userId: data.user.id, plusAccess, lessons: IDIOM_LESSONS });
      }
      if (typeof rawId !== 'string' || !/^[1-9]\d*$/.test(rawId)) {
        return res.status(400).json({ error: 'Invalid lesson.' });
      }
      const lesson = IDIOM_LESSONS.find(item => item.id === Number(rawId));
      if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });
      if (lesson.access === 'premium' && !plusAccess) {
        return res.status(403).json({ userId: data.user.id, plusAccess, error: 'Lessons 2 and beyond are included with ePeak+.' });
      }
      const items = IDIOM_LESSON_CONTENT[lesson.id];
      if (!lesson.published || !items) {
        return res.status(404).json({ userId: data.user.id, plusAccess, code: 'COMING_SOON', error: 'This lesson is coming soon.' });
      }
      return res.status(200).json({ userId: data.user.id, plusAccess, lesson, items });
    } catch {
      return res.status(503).json({ error: 'Access could not be checked. Please try again.' });
    }
  };
}

const configuredHandler = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createIdiomsHandler({
      supabase: createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
    })
  : null;

export default async function handler(req, res) {
  if (!configuredHandler) {
    preventCaching(res);
    return res.status(503).json({ error: 'Idioms Lessons access is not configured. Please try again later.' });
  }
  return configuredHandler(req, res);
}
