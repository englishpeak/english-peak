import { createClient } from '@supabase/supabase-js';
import { hasFullAccessTier } from '../businesscases/access.js';
import { IDIOM_LESSONS } from '../idioms/catalog.js';

// Server-only lesson content. Lesson 1 preserves the approved prototype verbatim.
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
  ],
  "2": [
    {
      "id": 1,
      "idiom": "Bite the bullet",
      "question": "What does \"bite the bullet\" mean?",
      "options": [
        "To accept an unpleasant situation and face it bravely.",
        "To make an impulsive decision without thinking.",
        "To respond aggressively to criticism.",
        "To refuse to participate in a difficult task."
      ],
      "correct": 0,
      "examples": [
        "I finally bit the bullet and booked my dentist appointment.",
        "We had to bite the bullet and pay for the repairs.",
        "She decided to bite the bullet and tell her manager the truth.",
        "Sometimes you just have to bite the bullet and start over."
      ],
      "spanish": "Hacer de tripas corazón."
    },
    {
      "id": 2,
      "idiom": "The ball is in your court",
      "question": "What does \"the ball is in your court\" mean?",
      "options": [
        "You have an advantage over everyone else.",
        "It's your responsibility to make the next decision or take action.",
        "You have missed an important opportunity.",
        "Someone else is responsible for your mistakes."
      ],
      "correct": 1,
      "examples": [
        "I've sent you the proposal, so the ball is in your court now.",
        "We made our offer, and the ball is in their court.",
        "I've told you how I feel. The ball is in your court.",
        "The company has all the information it needs, so the ball is in its court."
      ],
      "spanish": "Ahora te toca a ti decidir / La decisión está en tus manos."
    },
    {
      "id": 3,
      "idiom": "Cut corners",
      "question": "What does \"cut corners\" mean?",
      "options": [
        "To shorten a meeting by removing unnecessary topics.",
        "To simplify something without affecting its quality.",
        "To do something cheaply or quickly by skipping important steps.",
        "To find a clever solution to a complicated problem."
      ],
      "correct": 2,
      "examples": [
        "The contractor cut corners, and the roof started leaking.",
        "We can't afford to cut corners when it comes to safety.",
        "Some companies cut corners to reduce production costs.",
        "If you cut corners during training, you'll struggle later."
      ],
      "spanish": "Hacer las cosas al aventón / Ahorrarse pasos importantes."
    },
    {
      "id": 4,
      "idiom": "Get cold feet",
      "question": "What does \"get cold feet\" mean?",
      "options": [
        "To lose confidence or become nervous before doing something.",
        "To suddenly change your opinion about someone.",
        "To feel uncomfortable in an unfamiliar environment.",
        "To regret something after it has already happened."
      ],
      "correct": 0,
      "examples": [
        "He got cold feet just before proposing to his girlfriend.",
        "I was going to quit my job, but I got cold feet.",
        "Don't get cold feet now. You've prepared for this presentation for weeks.",
        "She got cold feet about moving abroad at the last minute."
      ],
      "spanish": "Echarse para atrás por miedo / Entrarle miedo a última hora."
    },
    {
      "id": 5,
      "idiom": "Go the extra mile",
      "question": "What does \"go the extra mile\" mean?",
      "options": [
        "To work longer hours than everyone else.",
        "To make an additional effort beyond what is expected.",
        "To take unnecessary risks to achieve a goal.",
        "To complete a task without asking for help."
      ],
      "correct": 1,
      "examples": [
        "Our teacher always goes the extra mile to help struggling students.",
        "She went the extra mile to make the guests feel welcome.",
        "Great customer service means being willing to go the extra mile.",
        "He went the extra mile by preparing a personalised report for each client."
      ],
      "spanish": "Dar el extra / Hacer un esfuerzo adicional."
    },
    {
      "id": 6,
      "idiom": "On the fence",
      "question": "What does \"be on the fence\" mean?",
      "options": [
        "To avoid getting involved in other people's problems.",
        "To disagree with both sides of an argument.",
        "To feel uncertain or undecided between different options.",
        "To support an unpopular opinion."
      ],
      "correct": 2,
      "examples": [
        "I'm still on the fence about buying a new car.",
        "She's on the fence about accepting the job offer.",
        "Many voters remain on the fence ahead of the election.",
        "I was on the fence at first, but the reviews convinced me."
      ],
      "spanish": "Estar indeciso / No decidirse todavía."
    },
    {
      "id": 7,
      "idiom": "Throw in the towel",
      "question": "What does \"throw in the towel\" mean?",
      "options": [
        "To abandon a task temporarily.",
        "To admit defeat or stop trying.",
        "To accept responsibility for a mistake.",
        "To ask someone else to finish your work."
      ],
      "correct": 1,
      "examples": [
        "After three failed attempts, he was ready to throw in the towel.",
        "Don't throw in the towel just because the first interview went badly.",
        "The team refused to throw in the towel despite being three goals behind.",
        "She finally threw in the towel and closed the struggling business."
      ],
      "spanish": "Tirar la toalla."
    },
    {
      "id": 8,
      "idiom": "Take it with a grain of salt",
      "question": "What does \"take it with a grain of salt\" mean?",
      "options": [
        "To deliberately ignore someone's advice.",
        "To accept criticism without becoming upset.",
        "To believe something only after confirming it with an expert.",
        "To be sceptical about information rather than believing it completely."
      ],
      "correct": 3,
      "examples": [
        "Take his predictions with a grain of salt. He's often wrong.",
        "I read the online reviews, but I take them with a grain of salt.",
        "You should take anything you hear from that gossip account with a grain of salt.",
        "She tends to exaggerate, so I take her stories with a grain of salt."
      ],
      "spanish": "Tomarlo con reservas / No creérselo del todo."
    },
    {
      "id": 9,
      "idiom": "Burn bridges",
      "question": "What does \"burn bridges\" mean?",
      "options": [
        "To permanently damage relationships or eliminate opportunities to return.",
        "To deliberately challenge someone in authority.",
        "To end a friendship because of a misunderstanding.",
        "To stop communicating with people for a short period."
      ],
      "correct": 0,
      "examples": [
        "Don't burn bridges when you leave your current job.",
        "He burned his bridges with the company after publicly insulting his manager.",
        "You can disagree with someone without burning bridges.",
        "She regretted burning bridges with her former colleagues."
      ],
      "spanish": "Cerrar puertas / Romper relaciones definitivamente."
    },
    {
      "id": 10,
      "idiom": "A blessing in disguise",
      "question": "What does \"a blessing in disguise\" mean?",
      "options": [
        "Something positive that happens when you least expect it.",
        "An unexpected reward for helping someone.",
        "Something that initially seems bad but eventually turns out to be beneficial.",
        "A lucky opportunity that requires little effort."
      ],
      "correct": 2,
      "examples": [
        "Losing that job turned out to be a blessing in disguise because I found a better one.",
        "Missing the train was a blessing in disguise; the next one was much less crowded.",
        "The project cancellation seemed terrible, but it was a blessing in disguise.",
        "Sometimes rejection is a blessing in disguise."
      ],
      "spanish": "No hay mal que por bien no venga."
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
