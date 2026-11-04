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
      "idiom": "Pull someone's leg",
      "question": "What does \"pull someone's leg\" mean?",
      "options": [
        "To deliberately embarrass someone in public.",
        "To joke with someone or playfully trick them.",
        "To persuade someone to change their opinion.",
        "To help someone overcome a difficult situation."
      ],
      "correct": 1,
      "examples": [
        "Relax! I'm just pulling your leg.",
        "He told me he'd won the lottery, but he was only pulling my leg.",
        "Are you serious, or are you pulling my leg?",
        "My brother loves pulling my leg about my terrible cooking."
      ],
      "spanish": "Tomarle el pelo a alguien / Estarle tomando el pelo."
    },
    {
      "id": 2,
      "idiom": "Beat around the bush",
      "question": "What does \"beat around the bush\" mean?",
      "options": [
        "To exaggerate the importance of a problem.",
        "To discuss something without understanding it.",
        "To spend too much time explaining minor details.",
        "To avoid talking about something directly."
      ],
      "correct": 3,
      "examples": [
        "Stop beating around the bush and tell me what happened.",
        "She kept beating around the bush instead of answering my question.",
        "I don't want to beat around the bush, so I'll be direct.",
        "He beat around the bush for ten minutes before admitting his mistake."
      ],
      "spanish": "Andarse por las ramas / Darle vueltas al asunto."
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
  ],
  "3": [
    {
      "id": 1,
      "idiom": "Read between the lines",
      "question": "What does \"read between the lines\" mean?",
      "options": [
        "To carefully analyse every word in a document.",
        "To misunderstand something because of missing information.",
        "To understand a hidden or implied meaning.",
        "To discover that someone has deliberately lied."
      ],
      "correct": 2,
      "examples": [
        "She said everything was fine, but I could read between the lines.",
        "You need to read between the lines to understand what he's really suggesting.",
        "His email sounded polite, but reading between the lines, I could tell he was disappointed.",
        "If you read between the lines of the announcement, you'll realise the company is planning major changes."
      ],
      "spanish": "Leer entre líneas."
    },
    {
      "id": 2,
      "idiom": "Take a rain check",
      "question": "What does \"take a rain check\" mean?",
      "options": [
        "To postpone an invitation or offer until another time.",
        "To cancel plans permanently without explanation.",
        "To accept an invitation at the last minute.",
        "To make alternative arrangements because of bad weather."
      ],
      "correct": 0,
      "examples": [
        "I'd love to join you for dinner, but can I take a rain check?",
        "She took a rain check on our coffee plans because she wasn't feeling well.",
        "Can we take a rain check on the movie? I'm exhausted.",
        "Thanks for inviting me! I'll have to take a rain check this time."
      ],
      "spanish": "Dejarlo para otra ocasión / Te tomo la palabra para otro día."
    },
    {
      "id": 3,
      "idiom": "Get the hang of something",
      "question": "What does \"get the hang of something\" mean?",
      "options": [
        "To become bored with a repetitive activity.",
        "To complete a difficult task without assistance.",
        "To develop an interest in an unfamiliar subject.",
        "To learn how to do something through practice."
      ],
      "correct": 3,
      "examples": [
        "Driving a manual car was difficult at first, but I eventually got the hang of it.",
        "Don't worry! You'll get the hang of the software after a few days.",
        "It took me a while to get the hang of speaking in front of large audiences.",
        "Once you get the hang of the technique, it becomes much easier."
      ],
      "spanish": "Agarrarle la onda / Agarrarle el modo / Cogerle el truco (Spain)."
    },
    {
      "id": 4,
      "idiom": "Back to square one",
      "question": "What does \"back to square one\" mean?",
      "options": [
        "To return to a familiar place after a long absence.",
        "To start again from the beginning after a failed attempt.",
        "To make progress by repeating a successful strategy.",
        "To abandon a project before completing its first stage."
      ],
      "correct": 1,
      "examples": [
        "The experiment failed, so we're back to square one.",
        "We thought we'd solved the problem, but the new error sent us back to square one.",
        "After losing all our project files, we were back to square one.",
        "If the client rejects the proposal, we'll have to go back to square one."
      ],
      "spanish": "Volver a empezar de cero / Regresar al punto de partida."
    },
    {
      "id": 5,
      "idiom": "In hot water",
      "question": "What does \"be in hot water\" mean?",
      "options": [
        "To be in trouble because of something you've done.",
        "To feel extremely stressed about an upcoming event.",
        "To find yourself in a physically dangerous situation.",
        "To receive unexpected criticism for a successful decision."
      ],
      "correct": 0,
      "examples": [
        "He got into hot water after missing three important deadlines.",
        "You'll be in hot water if your parents find out what happened.",
        "The politician found himself in hot water after making those comments.",
        "She was in hot water with her manager for sharing confidential information."
      ],
      "spanish": "Estar en problemas / Meterse en un lío / Estar en aprietos."
    },
    {
      "id": 6,
      "idiom": "Keep someone in the loop",
      "question": "What does \"keep someone in the loop\" mean?",
      "options": [
        "To involve someone in every decision, regardless of its importance.",
        "To repeatedly remind someone about an unfinished task.",
        "To keep someone informed about developments or decisions.",
        "To prevent someone from leaving a particular situation."
      ],
      "correct": 2,
      "examples": [
        "Please keep me in the loop about any changes to the schedule.",
        "Our manager always keeps the entire team in the loop.",
        "I'll keep you in the loop as soon as I hear anything from the client.",
        "She felt frustrated because nobody had kept her in the loop about the project."
      ],
      "spanish": "Mantener a alguien al tanto / Mantener informado a alguien."
    },
    {
      "id": 7,
      "idiom": "Miss the boat",
      "question": "What does \"miss the boat\" mean?",
      "options": [
        "To arrive late because of unexpected circumstances.",
        "To misunderstand the purpose of an opportunity.",
        "To make the wrong decision despite having enough information.",
        "To lose an opportunity by acting too late."
      ],
      "correct": 3,
      "examples": [
        "I wanted to buy tickets, but I waited too long and missed the boat.",
        "Several companies missed the boat when online shopping became popular.",
        "If you don't apply before Friday, you'll miss the boat.",
        "He missed the boat on investing in that company when it was still small."
      ],
      "spanish": "Dejar pasar una oportunidad / Se te fue el tren."
    },
    {
      "id": 8,
      "idiom": "A tough nut to crack",
      "question": "What does \"a tough nut to crack\" mean?",
      "options": [
        "A person who refuses to accept any criticism.",
        "A problem or person that is difficult to understand or deal with.",
        "A challenge that requires considerable physical strength.",
        "A situation that seems difficult but has a very simple solution."
      ],
      "correct": 1,
      "examples": [
        "This mathematical problem is a tough nut to crack.",
        "The new client is a tough nut to crack, but we're making progress.",
        "Finding an affordable apartment in this neighbourhood is a tough nut to crack.",
        "He's a tough nut to crack when it comes to discussing his feelings."
      ],
      "spanish": "Un hueso duro de roer."
    },
    {
      "id": 9,
      "idiom": "Jump to conclusions",
      "question": "What does \"jump to conclusions\" mean?",
      "options": [
        "To make a quick decision under pressure.",
        "To predict an outcome based on previous experience.",
        "To form an opinion without having enough evidence.",
        "To reach an agreement before discussing every possibility."
      ],
      "correct": 2,
      "examples": [
        "Don't jump to conclusions. We haven't heard her side of the story.",
        "He jumped to conclusions when he saw the unfamiliar name on her phone.",
        "It's easy to jump to conclusions when you don't have all the facts.",
        "Instead of jumping to conclusions, let's investigate what actually happened."
      ],
      "spanish": "Sacar conclusiones precipitadas / Adelantarse a los hechos."
    },
    {
      "id": 10,
      "idiom": "The last straw",
      "question": "What does \"the last straw\" mean?",
      "options": [
        "The final problem in a series that makes a situation unbearable.",
        "The last opportunity to correct a serious mistake.",
        "The final stage of a particularly difficult process.",
        "A minor inconvenience that can easily be ignored."
      ],
      "correct": 0,
      "examples": [
        "His constant lateness was annoying, but missing the wedding was the last straw.",
        "The unexpected price increase was the last straw for many customers.",
        "When my boss cancelled my holiday again, that was the last straw.",
        "We'd been having problems for months, but his dishonesty was the last straw."
      ],
      "spanish": "La gota que derramó el vaso."
    }
  ],
  "4": [
    {
      "id": 1,
      "idiom": "Out of the blue",
      "question": "What does \"out of the blue\" mean?",
      "options": [
        "After a long period of preparation.",
        "At a particularly convenient moment.",
        "Suddenly and completely unexpectedly.",
        "Without understanding the consequences."
      ],
      "correct": 2,
      "examples": [
        "My old high school friend called me out of the blue yesterday.",
        "She received a job offer out of the blue.",
        "The company announced the changes completely out of the blue.",
        "He showed up at my house out of the blue after five years."
      ],
      "spanish": "De la nada / Así de repente / Sin previo aviso."
    },
    {
      "id": 2,
      "idiom": "Get something off your chest",
      "question": "What does \"get something off your chest\" mean?",
      "options": [
        "To express something that's been worrying or bothering you.",
        "To overcome a difficult situation without asking for help.",
        "To admit responsibility for something you didn't do.",
        "To forget about an unpleasant experience."
      ],
      "correct": 0,
      "examples": [
        "I need to get something off my chest. I've been worried about this for weeks.",
        "She finally got it off her chest and told her friend how she felt.",
        "If something's bothering you, it's better to get it off your chest.",
        "He felt relieved after getting everything off his chest."
      ],
      "spanish": "Desahogarse / Sacarse algo del pecho."
    },
    {
      "id": 3,
      "idiom": "See eye to eye",
      "question": "What does \"see eye to eye\" mean?",
      "options": [
        "To understand someone's feelings without speaking.",
        "To pay close attention to another person's behaviour.",
        "To admire someone because of their achievements.",
        "To agree with someone or share the same opinion."
      ],
      "correct": 3,
      "examples": [
        "My brother and I don't always see eye to eye on politics.",
        "It's important that business partners see eye to eye on major decisions.",
        "We finally saw eye to eye after discussing the problem.",
        "They rarely see eye to eye when it comes to raising their children."
      ],
      "spanish": "Estar de acuerdo / Coincidir en la forma de pensar."
    },
    {
      "id": 4,
      "idiom": "Up in the air",
      "question": "What does \"up in the air\" mean?",
      "options": [
        "Extremely unlikely to happen.",
        "Not yet decided or confirmed.",
        "Completely beyond someone's control.",
        "More complicated than originally expected."
      ],
      "correct": 1,
      "examples": [
        "Our holiday plans are still up in the air.",
        "The date of the meeting is up in the air until everyone confirms.",
        "Whether the company will open a new office is still up in the air.",
        "Everything's up in the air because we haven't received approval yet."
      ],
      "spanish": "Estar en el aire / Todavía no estar definido."
    },
    {
      "id": 5,
      "idiom": "Hit the ground running",
      "question": "What does \"hit the ground running\" mean?",
      "options": [
        "To start a new activity or job immediately and effectively.",
        "To recover quickly after making a serious mistake.",
        "To begin working without understanding the instructions.",
        "To complete a project much earlier than expected."
      ],
      "correct": 0,
      "examples": [
        "She hit the ground running on her first day at the new company.",
        "We need someone who can hit the ground running without weeks of training.",
        "The team hit the ground running after the holiday break.",
        "He hit the ground running and secured three clients in his first week."
      ],
      "spanish": "Empezar con todo / Arrancar con el pie derecho."
    },
    {
      "id": 6,
      "idiom": "Keep your chin up",
      "question": "What does \"keep your chin up\" mean?",
      "options": [
        "To remain confident even when you're wrong.",
        "To avoid showing your emotions in public.",
        "To stay positive and hopeful during difficult times.",
        "To ignore criticism from people around you."
      ],
      "correct": 2,
      "examples": [
        "Keep your chin up! I'm sure you'll find another job soon.",
        "I know you're disappointed, but keep your chin up.",
        "She told her son to keep his chin up after losing the competition.",
        "Even when things went wrong, he managed to keep his chin up."
      ],
      "spanish": "No te desanimes / Mantén el ánimo / Arriba ese ánimo."
    },
    {
      "id": 7,
      "idiom": "Draw the line",
      "question": "What does \"draw the line\" mean?",
      "options": [
        "To make a clear distinction between two similar ideas.",
        "To establish a limit on what you're willing to accept.",
        "To end an argument by agreeing with the other person.",
        "To separate personal responsibilities from professional ones."
      ],
      "correct": 1,
      "examples": [
        "I don't mind working late occasionally, but I draw the line at working every weekend.",
        "You have to draw the line when people start taking advantage of you.",
        "She draws the line at lending money to coworkers.",
        "Everyone has to decide where to draw the line when it comes to privacy."
      ],
      "spanish": "Poner límites / Marcar la raya / Hasta ahí llegar."
    },
    {
      "id": 8,
      "idiom": "A long shot",
      "question": "What does \"a long shot\" mean?",
      "options": [
        "A difficult decision that requires careful planning.",
        "An opportunity that takes a long time to develop.",
        "A strategy that involves taking unnecessary risks.",
        "An attempt or possibility with very little chance of success."
      ],
      "correct": 3,
      "examples": [
        "Getting tickets for the sold-out concert is a long shot, but I'll try.",
        "It's a long shot, but maybe the company will reconsider our proposal.",
        "Winning the competition would be a long shot for such a small team.",
        "I know it's a long shot, but I'm going to apply for the scholarship anyway."
      ],
      "spanish": "Una posibilidad muy remota / Está difícil, pero vale la pena intentar."
    },
    {
      "id": 9,
      "idiom": "By the book",
      "question": "What does \"by the book\" mean?",
      "options": [
        "Following established rules or procedures exactly.",
        "Learning how to do something without practical experience.",
        "Making decisions based on advice from experts.",
        "Completing a task in the traditional way rather than using technology."
      ],
      "correct": 0,
      "examples": [
        "Our new manager does everything by the book.",
        "The inspector insisted that every procedure be followed by the book.",
        "We can't take shortcuts here. Everything has to be done by the book.",
        "She always plays by the book, even when nobody's watching."
      ],
      "spanish": "Hacer las cosas al pie de la letra / Seguir las reglas estrictamente."
    },
    {
      "id": 10,
      "idiom": "Make ends meet",
      "question": "What does \"make ends meet\" mean?",
      "options": [
        "To save enough money for a major purchase.",
        "To earn enough money to cover basic living expenses.",
        "To pay off all your debts ahead of schedule.",
        "To manage several financial investments successfully."
      ],
      "correct": 1,
      "examples": [
        "With rent increasing every year, it's becoming harder to make ends meet.",
        "She worked two jobs to make ends meet while studying.",
        "Many families struggle to make ends meet during difficult economic times.",
        "He had to reduce his expenses just to make ends meet."
      ],
      "spanish": "Llegar a fin de mes / Sacar para los gastos."
    }
  ],
  "5": [
    {
      "id": 1,
      "idiom": "Go with the flow",
      "question": "What does \"go with the flow\" mean?",
      "options": [
        "To follow other people's instructions without questioning them.",
        "To avoid making plans because you dislike responsibilities.",
        "To change your opinion whenever someone disagrees with you.",
        "To adapt to circumstances instead of trying to control everything."
      ],
      "correct": 3,
      "examples": [
        "We don't have a strict itinerary for the trip. We're just going to go with the flow.",
        "I used to worry about every little detail, but now I try to go with the flow.",
        "When plans change unexpectedly, sometimes it's better to go with the flow.",
        "Everyone else wanted to stay longer, so I decided to go with the flow."
      ],
      "spanish": "Dejarse llevar / Ir viendo qué pasa."
    },
    {
      "id": 2,
      "idiom": "Break even",
      "question": "What does \"break even\" mean?",
      "options": [
        "To earn enough money to expand a business.",
        "To recover financially after experiencing heavy losses.",
        "To have no overall profit or loss because income equals expenses.",
        "To divide the profits of a business equally among its owners."
      ],
      "correct": 2,
      "examples": [
        "Our small business finally broke even after its first year.",
        "We sold enough tickets to break even, but we didn't make a profit.",
        "The restaurant needs at least 50 customers a day to break even.",
        "I'll be happy if we manage to break even on this event."
      ],
      "spanish": "Salir tablas / Quedar a mano / No ganar ni perder."
    },
    {
      "id": 3,
      "idiom": "Play it by ear",
      "question": "What does \"play it by ear\" mean?",
      "options": [
        "To decide what to do as a situation develops instead of planning everything in advance.",
        "To rely on someone else's experience when making an important decision.",
        "To delay making a decision because you're afraid of the consequences.",
        "To repeat something until you can do it without instructions."
      ],
      "correct": 0,
      "examples": [
        "We haven't decided where to eat tomorrow. We'll just play it by ear.",
        "Let's see how the weather looks and play it by ear.",
        "I'm not sure how long the meeting will take, so we'll have to play it by ear.",
        "We don't need a detailed schedule for the weekend. Let's play it by ear."
      ],
      "spanish": "Ir improvisando / Decidir sobre la marcha."
    },
    {
      "id": 4,
      "idiom": "Leave no stone unturned",
      "question": "What does \"leave no stone unturned\" mean?",
      "options": [
        "To avoid taking unnecessary risks when searching for something.",
        "To try every possible approach or investigate every possibility.",
        "To continue working even when success is impossible.",
        "To complete a difficult task without asking anyone for assistance."
      ],
      "correct": 1,
      "examples": [
        "The police promised to leave no stone unturned in their investigation.",
        "We'll leave no stone unturned until we find the missing documents.",
        "She left no stone unturned while searching for the perfect apartment.",
        "The research team left no stone unturned in trying to identify the cause."
      ],
      "spanish": "Agotar todas las posibilidades / No dejar piedra sin mover."
    },
    {
      "id": 5,
      "idiom": "In the nick of time",
      "question": "What does \"in the nick of time\" mean?",
      "options": [
        "Much earlier than originally expected.",
        "Immediately after receiving an urgent request.",
        "At exactly the scheduled time, without any delays.",
        "Just before it becomes too late."
      ],
      "correct": 3,
      "examples": [
        "We arrived at the airport in the nick of time and barely made our flight.",
        "The firefighters rescued the family in the nick of time.",
        "She submitted her application in the nick of time, just seconds before the deadline.",
        "I caught the glass in the nick of time before it hit the floor."
      ],
      "spanish": "Justo a tiempo / En el último momento / Por un pelo."
    },
    {
      "id": 6,
      "idiom": "Get out of hand",
      "question": "What does \"get out of hand\" mean?",
      "options": [
        "To become difficult or impossible to control.",
        "To develop more quickly than anyone anticipated.",
        "To become too complicated for one person to understand.",
        "To require additional resources to finish successfully."
      ],
      "correct": 0,
      "examples": [
        "The argument got out of hand, and someone called the police.",
        "What started as a small celebration quickly got out of hand.",
        "We need to address these expenses before they get out of hand.",
        "The situation got out of hand when hundreds of people showed up unexpectedly."
      ],
      "spanish": "Salirse de control / Irse de las manos."
    },
    {
      "id": 7,
      "idiom": "Give someone the benefit of the doubt",
      "question": "What does \"give someone the benefit of the doubt\" mean?",
      "options": [
        "To forgive someone even when they've deliberately hurt you.",
        "To trust someone's judgement in every situation.",
        "To believe or trust someone despite uncertainty or insufficient evidence.",
        "To avoid confronting someone because you fear their reaction."
      ],
      "correct": 2,
      "examples": [
        "He was late again, but I decided to give him the benefit of the doubt.",
        "Let's give her the benefit of the doubt until we hear her explanation.",
        "I usually give people the benefit of the doubt when I first meet them.",
        "She gave her colleague the benefit of the doubt instead of immediately assuming he'd lied."
      ],
      "spanish": "Darle a alguien el beneficio de la duda."
    },
    {
      "id": 8,
      "idiom": "Put all your eggs in one basket",
      "question": "What does \"put all your eggs in one basket\" mean?",
      "options": [
        "To make several investments without properly researching them.",
        "To depend entirely on one opportunity or plan, risking everything if it fails.",
        "To spend all your savings on something that isn't necessary.",
        "To take responsibility for several difficult tasks simultaneously."
      ],
      "correct": 1,
      "examples": [
        "Don't put all your eggs in one basket. Apply to several universities.",
        "He invested all his savings in one company and put all his eggs in one basket.",
        "It's risky to put all your eggs in one basket when looking for a job.",
        "We should diversify our clients instead of putting all our eggs in one basket."
      ],
      "spanish": "Poner todos los huevos en una sola canasta / Apostarlo todo a una sola carta."
    },
    {
      "id": 9,
      "idiom": "The elephant in the room",
      "question": "What does \"the elephant in the room\" mean?",
      "options": [
        "A small disagreement that eventually becomes a serious conflict.",
        "A problem that nobody knows how to solve.",
        "An obvious, important issue that people deliberately avoid discussing.",
        "An uncomfortable situation caused by someone's inappropriate behaviour."
      ],
      "correct": 2,
      "examples": [
        "Everyone knew the company was losing money, but nobody wanted to address the elephant in the room.",
        "Let's talk about the elephant in the room: our project is already two months behind schedule.",
        "His resignation was the elephant in the room during the meeting.",
        "They kept making small talk, ignoring the elephant in the room."
      ],
      "spanish": "El tema incómodo que nadie quiere tocar / El problema evidente que todos evitan mencionar."
    },
    {
      "id": 10,
      "idiom": "Let sleeping dogs lie",
      "question": "What does \"let sleeping dogs lie\" mean?",
      "options": [
        "To ignore a problem until it becomes serious enough to address.",
        "To forgive someone without asking for an explanation.",
        "To avoid discussing sensitive topics with unfamiliar people.",
        "To avoid bringing up an old problem that could cause new trouble."
      ],
      "correct": 3,
      "examples": [
        "I thought about asking why they broke up, but decided to let sleeping dogs lie.",
        "The argument happened years ago. It's better to let sleeping dogs lie.",
        "She wanted to confront her former boss, but her friends advised her to let sleeping dogs lie.",
        "We finally have a peaceful relationship, so let's just let sleeping dogs lie."
      ],
      "spanish": "No remover el pasado / Mejor no moverle / No reabrir viejas heridas."
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
