/* Workout plan data: Push / Pull / Legs, Mon-Fri. Edit here to change the plan. */
(function (root) {
  'use strict';

  var WARMUP = [
    'Row easy, 3 min',
    '10 arm circles each way',
    '10 bodyweight squats',
    '10 light cable shoulder pulls'
  ];

  var COOLDOWN = [
    "Child's pose",
    'Cat-cow',
    'Downward dog',
    'Low lunge, each side',
    'Hamstring fold',
    'Figure-four, each side',
    'Chest / shoulder stretch'
  ];

  /* How-to + tip per exercise (keyed by the exact exercise name that is logged). */
  var GUIDE = {
    'Chest press machine': {
      how: 'Set the seat so the handles sit level with mid-chest. Press out without locking your elbows, then return slowly.',
      tip: 'Keep your shoulder blades pinched back against the pad.'
    },
    'Incline dumbbell press': {
      how: 'Bench at about 30 degrees. Lower the dumbbells to the sides of your upper chest, then press up and slightly together.',
      tip: 'Elbows about 45 degrees from your body, not flared.'
    },
    'Dumbbell bench press': {
      how: 'Lie flat, feet on the floor. Lower until your upper arms are about level with the bench, then press up.',
      tip: 'Pick a weight you can control for the whole rep, since there is no spotter.'
    },
    'Cable chest fly': {
      how: 'Pulleys at shoulder height. Step forward, soft elbows, and sweep your hands together in front of your chest.',
      tip: 'Slow on the way back; do not let the weight pull your shoulders forward.'
    },
    'Cable crossover': {
      how: 'Pulleys set high. Step forward with soft elbows and sweep your hands down and together in front of your hips/chest.',
      tip: 'Slow on the way back; do not let the weight pull your shoulders forward.'
    },
    'Seated dumbbell shoulder press': {
      how: 'Back supported, dumbbells at ear level. Press straight up, then lower to ear level.',
      tip: 'Do not arch your lower back; squeeze your abs.'
    },
    'Dumbbell Arnold press': {
      how: 'Start with palms facing you at chest height. Press up while turning palms forward, then reverse on the way down.',
      tip: 'Go lighter than your normal shoulder press.'
    },
    'Cable lateral raise': {
      how: 'Stand sideways to a low pulley, handle in the far hand. Raise your arm out to the side to shoulder height with a slight elbow bend.',
      tip: 'Lead with your elbow, not your hand. Log one set for both arms.'
    },
    'Cable front raise': {
      how: 'Face away from a low pulley, handle between your legs or at your side. Raise straight ahead to shoulder height.',
      tip: 'No swinging; keep your ribs down.'
    },
    'Rope pushdown': {
      how: 'Cable high, elbows pinned to your sides. Push the rope down and spread the ends apart at the bottom.',
      tip: 'Only your forearms move.'
    },
    'Overhead cable triceps extension': {
      how: 'Face away from a high pulley, rope behind your head, one foot forward. Straighten your arms forward and up.',
      tip: 'Keep your elbows pointing forward, close to your head.'
    },
    'Seated cable row': {
      how: 'Sit tall, feet braced, slight knee bend. Pull the handle to your belly button, squeeze your shoulder blades, return slowly.',
      tip: 'Do not lean back to cheat the weight.'
    },
    'Wide-grip seated cable row': {
      how: 'Same setup with a wide bar. Pull to your lower chest with elbows out.',
      tip: 'Think about driving your elbows back.'
    },
    'Cable lat pulldown': {
      how: 'Thighs under the pad. Pull the bar to your upper chest, leaning back slightly.',
      tip: 'Start each rep by pulling your shoulders down, then bend your elbows.'
    },
    'One-arm dumbbell row': {
      how: 'One hand and knee on a bench, back flat. Pull the dumbbell to your hip, then lower fully.',
      tip: 'Do not twist your torso. Log one set for both sides.'
    },
    'Chest-supported dumbbell row': {
      how: 'Lie chest-down on an incline bench, a dumbbell in each hand. Row both up toward your hips.',
      tip: 'Pause for a second at the top.'
    },
    'Cable face pull': {
      how: 'Rope at upper-chest height. Pull toward your face, elbows high, and rotate your hands outward at the end.',
      tip: 'Light weight and a controlled pace beat heavy here.'
    },
    'Cable biceps curl': {
      how: 'Low pulley, elbows at your sides. Curl up and squeeze.',
      tip: 'Do not let your elbows drift forward.'
    },
    'Dumbbell hammer curl': {
      how: 'Palms facing each other. Curl up without turning your wrists, lower slowly.',
      tip: 'Alternate arms if you need to keep your form clean.'
    },
    'Back squat': {
      how: 'Bar across your upper back (rack, light), feet about shoulder-width. Sit down and back until thighs are about parallel, then stand.',
      tip: 'Set the safety bars in the rack; start with just the bar or very light weight.'
    },
    'Goblet squat': {
      how: 'Hold one dumbbell at your chest. Squat down between your knees, chest tall.',
      tip: 'A good way to practice squat form.'
    },
    'Dumbbell Romanian deadlift': {
      how: 'Dumbbells in front of your thighs, soft knees. Push your hips back and slide the dumbbells down your legs until you feel a hamstring stretch, then stand.',
      tip: 'Keep your back flat and the weights close.'
    },
    'Leg curl machine': {
      how: 'Pad just above your heels. Curl your heels toward your glutes, then lower slowly.',
      tip: 'Keep your hips down on the seat.'
    },
    'Dumbbell walking lunges': {
      how: 'Step forward, lower your back knee toward the floor, push through the front foot and step into the next lunge.',
      tip: 'Take a long enough step that your front knee stays over your ankle. Reps are per leg.'
    },
    'Cable pull-through': {
      how: 'Face away from a low pulley, rope between your legs. Push your hips back, then drive them forward and stand tall.',
      tip: 'It is a hip hinge: feel it in your glutes and hamstrings.'
    },
    'Calf raises': {
      how: 'Stand on a step or machine edge. Rise onto your toes, pause, then lower below the step.',
      tip: 'Use the full range, slowly.'
    },
    'Stair stepper': {
      how: 'Hold the rails lightly for balance only. Step with your whole foot on each step.',
      tip: 'Stay upright and do not lean your weight into the handles.'
    },
    'Rowing machine': {
      how: 'Push with your legs first, then lean back slightly, then pull the handle to your lower ribs. Reverse the order to return.',
      tip: 'Legs, body, arms; then arms, body, legs.'
    }
  };

  /* [name, sets, reps, per]  (per = "each arm" etc., shown next to the target) */
  var DAYS = {
    1: {
      key: 'mon', short: 'Mon', label: 'Mon push', title: 'Push',
      lifts: [
        ['Chest press machine', 3, 10],
        ['Incline dumbbell press', 3, 10],
        ['Cable chest fly', 3, 12],
        ['Seated dumbbell shoulder press', 3, 10],
        ['Cable lateral raise', 3, 12, 'each arm'],
        ['Rope pushdown', 3, 12]
      ],
      finisher: { name: 'Stair stepper', minutes: 10, label: 'Extra time: stair stepper' }
    },
    2: {
      key: 'tue', short: 'Tue', label: 'Tue pull', title: 'Pull',
      lifts: [
        ['Seated cable row', 3, 10],
        ['Cable lat pulldown', 3, 10],
        ['One-arm dumbbell row', 3, 10, 'each side'],
        ['Cable face pull', 3, 15],
        ['Cable biceps curl', 3, 12],
        ['Dumbbell hammer curl', 2, 12]
      ],
      finisher: { name: 'Rowing machine', minutes: 5, label: 'Finish: easy rowing' }
    },
    3: {
      key: 'wed', short: 'Wed', label: 'Wed legs', title: 'Legs',
      lifts: [
        ['Back squat', 3, 8],
        ['Dumbbell Romanian deadlift', 3, 10],
        ['Leg curl machine', 3, 12],
        ['Dumbbell walking lunges', 2, 10, 'each leg'],
        ['Cable pull-through', 3, 12],
        ['Calf raises', 3, 15]
      ],
      finisher: { name: 'Stair stepper', minutes: 8, label: 'Finish: easy stair stepper' }
    },
    4: {
      key: 'thu', short: 'Thu', label: 'Thu push', title: 'Push',
      lifts: [
        ['Dumbbell bench press', 3, 10],
        ['Chest press machine', 2, 12],
        ['Cable crossover', 3, 12],
        ['Dumbbell Arnold press', 3, 10],
        ['Cable front raise', 2, 12],
        ['Overhead cable triceps extension', 3, 12]
      ],
      finisher: { name: 'Stair stepper', minutes: 15, label: 'Extra time: stair stepper' }
    },
    5: {
      key: 'fri', short: 'Fri', label: 'Fri pull + legs', title: 'Pull + legs finisher',
      lifts: [
        ['Cable lat pulldown', 3, 10],
        ['Chest-supported dumbbell row', 3, 10],
        ['Wide-grip seated cable row', 3, 12],
        ['Cable face pull', 3, 15],
        ['Cable biceps curl', 3, 12],
        ['Leg curl machine', 2, 12],
        ['Goblet squat', 2, 12]
      ],
      finisher: { name: 'Stair stepper', minutes: 15, label: 'Finish: stair stepper' }
    }
  };

  var PLAN = { WARMUP: WARMUP, COOLDOWN: COOLDOWN, GUIDE: GUIDE, DAYS: DAYS };
  if (typeof module !== 'undefined' && module.exports) module.exports = PLAN;
  root.PLAN = PLAN;
})(typeof window !== 'undefined' ? window : globalThis);
