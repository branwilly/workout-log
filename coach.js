/* Coach cards: step-by-step form, trainer cues, mistakes, muscles, breathing/tempo, regressions,
 * an honest "the evidence" line, a demo video and a second library link for every exercise.
 * Loaded after plan.js; adds PLAN.COACH, PLAN.PRIMER, PLAN.VIDEOS, PLAN.REFS, PLAN.SAFETY, PLAN.LEVELS.
 * Everything here is plain data. Video is never downloaded or hosted: each demo is a YouTube ID that
 * the app only loads (youtube-nocookie) when you tap it. Citations were each checked against the
 * PubMed abstract; see tools/verify-links.js to re-check that every URL still resolves. */
(function (root) {
  'use strict';
  var PLAN = root.PLAN || (typeof module !== 'undefined' && module.exports && require('./plan.js'));

  /* Verified with YouTube oEmbed (title + channel + embeddable). */
  var VIDEOS = {
    "xUm0BiZCWlQ": { id: "xUm0BiZCWlQ", src: "ScottHermanFitness", title: "How To: Chest Press (Cybex)" },
    "8iPEnn-ltC8": { id: "8iPEnn-ltC8", src: "ScottHermanFitness", title: "How To: Dumbbell Incline Chest Press" },
    "I-Ue34qLxc4": { id: "I-Ue34qLxc4", src: "Andrew Kwong (DeltaBolic)", title: "The PERFECT Cable Chest Fly" },
    "rO_iEImwHyo": { id: "rO_iEImwHyo", src: "Max Euceda", title: "How to do the SEATED DUMBBELL SHOULDER PRESS! | 2 Minute Tutorial" },
    "Z5FA9aq3L6A": { id: "Z5FA9aq3L6A", src: "PureGym", title: "How To Do Cable Lateral Raises" },
    "vB5OHsJ3EME": { id: "vB5OHsJ3EME", src: "ScottHermanFitness", title: "How To: Rope Push-Down" },
    "GZbfZ033f74": { id: "GZbfZ033f74", src: "ScottHermanFitness", title: "How To: Seated Low Row (LF Cable)" },
    "AOpi-p0cJkc": { id: "AOpi-p0cJkc", src: "SilverSneakers", title: "Beginner's Guide: Lat Pulldown" },
    "dFzUjzfih7k": { id: "dFzUjzfih7k", src: "Max Euceda", title: "How to do the SINGLE ARM DUMBBELL ROW! | 2 Minute Tutorial" },
    "eTCBSFlCJ_s": { id: "eTCBSFlCJ_s", src: "National Academy of Sports Medicine (NASM)", title: "How to do a Face Pull | Proper Form & Technique | NASM" },
    "NFzTWp2qpiE": { id: "NFzTWp2qpiE", src: "Fit Father Project - Fitness For Busy Fathers", title: "How To Do Cable Bicep Curls - Full Video Tutorial and Step-by-Step Guide" },
    "zC3nLlEvin4": { id: "zC3nLlEvin4", src: "ScottHermanFitness", title: "How To: Dumbbell Hammer Curl" },
    "my0tLDaWyDU": { id: "my0tLDaWyDU", src: "Squat University", title: "How To Squat Correctly (NO BACK PAIN)" },
    "GQ5jj_zH2uA": { id: "GQ5jj_zH2uA", src: "Starting Strength", title: "New to the Squat? Start Here." },
    "gcNh17Ckjgg": { id: "gcNh17Ckjgg", src: "Jeremy Ethier", title: "How to PROPERLY Squat for Growth (4 Easy Steps)" },
    "FQKfr1YDhEk": { id: "FQKfr1YDhEk", src: "ScottHermanFitness", title: "How To: Dumbbell Romanian Deadlift" },
    "hQgFixeXdZo": { id: "hQgFixeXdZo", src: "Mike | J2FIT Strength & Conditioning", title: "Dumbbell Romanian (RDL) Deadlift |TECHNIQUE for Beginners" },
    "t9sTSr-JYSs": { id: "t9sTSr-JYSs", src: "SilverSneakers", title: "Beginner's Guide: Seated Leg Curl" },
    "Pbmj6xPo-Hw": { id: "Pbmj6xPo-Hw", src: "Buff Dudes Workouts", title: "Walking Lunges Exercise Tutorial | Build Legendary Legs & Cardio" },
    "I34ysEkPK7w": { id: "I34ysEkPK7w", src: "Bobby Maximus", title: "Dumbbell Walking Lunge - How To" },
    "pv8e6OSyETE": { id: "pv8e6OSyETE", src: "Renaissance Periodization", title: "Cable Pull Through" },
    "DbSF7ipBh5Y": { id: "DbSF7ipBh5Y", src: "Colossus Fitness", title: "How to PROPERLY Perform a Glute Pull Through | Fix Your Cable Pull Through Form NOW!" },
    "k8ipHzKeAkQ": { id: "k8ipHzKeAkQ", src: "Children's Hospital Colorado", title: "Exercises with an Athletic Trainer: Standing Calf Raises" },
    "SVtg-1loH4c": { id: "SVtg-1loH4c", src: "Colossus Fitness", title: "How to PROPERLY Standing Calf Raise | Tips & Common Mistakes" },
    "QsYre__-aro": { id: "QsYre__-aro", src: "Jeremy Ethier", title: "STOP Doing Dumbbell Press Like This (5 Mistakes Slowing Your Chest Gains)" },
    "taI4XduLpTk": { id: "taI4XduLpTk", src: "LIVESTRONG", title: "How to Do Cable Crossovers" },
    "3ml7BH7mNwQ": { id: "3ml7BH7mNwQ", src: "Men's Health", title: "How to do the Arnold Press" },
    "vtH93qBItdk": { id: "vtH93qBItdk", src: "PureGym", title: "How To Do A Cable Front Raise" },
    "1u18yJELsh0": { id: "1u18yJELsh0", src: "Renaissance Periodization", title: "Cable Overhead Triceps Extension" },
    "ro2vfHfD0DQ": { id: "ro2vfHfD0DQ", src: "Jack Hanrahan Fitness", title: "How To Do A Chest Supported Dumbbell Row Correctly" },
    "YKAeU55CkVk": { id: "YKAeU55CkVk", src: "ScottHermanFitness", title: "How To: Wide-Grip Low Row (LF Cable)" },
    "MeIiIdhvXT4": { id: "MeIiIdhvXT4", src: "ScottHermanFitness", title: "How To: Goblet Squat" },
    "Z_4djaNyKEE": { id: "Z_4djaNyKEE", src: "Flex Marks", title: "How To Set-Up & Use a Stairmaster" },
    "4zWu1yuJ0_g": { id: "4zWu1yuJ0_g", src: "concept2usa", title: "Correct Rowing Machine Technique, Improve Your Rowing  | Concept2" },
    "XaOzjG1ZUbw": { id: "XaOzjG1ZUbw", src: "Starting Strength", title: "How to Set Up Your Safeties for Heavy Squats with Ray Gillenwater" },
    "hlTthXUxSZw": { id: "hlTthXUxSZw", src: "Starting Strength", title: "Stay Safe When You Bench Press - How to Set the Safety Pins with Mark Rippetoe" },
    "2W_gXhut5S8": { id: "2W_gXhut5S8", src: "Hinge Health", title: "How to Do a Hip Hinge: A Guide from Physical Therapists" },
    "7FF6VLej_bY": { id: "7FF6VLej_bY", src: "Squat University", title: "Squat Form For Your Anatomy [Perfect Depth Stance And Width]" },
    "pCEpcIo-O4I": { id: "pCEpcIo-O4I", src: "Squat University", title: "The GREATEST Squat Warm Up Routine" }
  };

  /* Peer-reviewed sources (each opened on PubMed; DOIs resolve via doi.org). */
  var REFS = {
    bloomquist2013: { cite: "Bloomquist et al. 2013", journal: "Eur J Appl Physiol", pmid: "23604798", doi: "10.1007/s00421-013-2642-7", title: "Effect of range of motion in heavy load squatting on muscle and tendon adaptations." },
    kubo2019: { cite: "Kubo et al. 2019", journal: "Eur J Appl Physiol", pmid: "31230110", doi: "10.1007/s00421-019-04181-y", title: "Effects of squat training with different depths on lower limb muscle volumes." },
    bryanton2012: { cite: "Bryanton et al. 2012", journal: "J Strength Cond Res", pmid: "22797000", doi: "10.1519/JSC.0b013e31826791a7", title: "Effect of squat depth and barbell load on relative muscular effort in squatting." },
    fry2003: { cite: "Fry et al. 2003", journal: "J Strength Cond Res", pmid: "14636100", doi: "10.1519/1533-4287(2003)017<0629:eokpoh>2.0.co;2", title: "Effect of knee position on hip and knee torques during the barbell squat." },
    escamilla2001: { cite: "Escamilla et al. 2001", journal: "Med Sci Sports Exerc", pmid: "11528346", doi: "10.1097/00005768-200109000-00020", title: "Effects of technique variations on knee biomechanics during the squat and leg press." },
    schoenfeld2020rom: { cite: "Schoenfeld et al. 2020", journal: "SAGE Open Med", pmid: "32030125", doi: "10.1177/2050312120901559", title: "Effects of range of motion on muscle development during resistance training interventions: A systematic review." },
    farrokhi2008: { cite: "Farrokhi et al. 2008", journal: "J Orthop Sports Phys Ther", pmid: "18591759", doi: "10.2519/jospt.2008.2634", title: "Trunk position influences the kinematics, kinetics, and muscle activity of the lead lower extremity during the forward lunge exercise." },
    maeo2021: { cite: "Maeo et al. 2021", journal: "Med Sci Sports Exerc", pmid: "33009197", doi: "10.1249/MSS.0000000000002523", title: "Greater Hamstrings Muscle Hypertrophy but Similar Damage Protection after Training at Long versus Short Muscle Lengths." },
    kinoshita2023: { cite: "Kinoshita et al. 2023", journal: "Front Physiol", pmid: "38156065", doi: "10.3389/fphys.2023.1272106", title: "Triceps surae muscle hypertrophy is greater after standing versus seated calf-raise training." },
    maeo2023: { cite: "Maeo et al. 2023", journal: "Eur J Sport Sci", pmid: "35819335", doi: "10.1080/17461391.2022.2100279", title: "Triceps brachii hypertrophy is substantially greater after elbow extension training performed in the overhead versus neutral arm position." },
    trebs2010: { cite: "Trebs et al. 2010", journal: "J Strength Cond Res", pmid: "20512064", doi: "10.1519/JSC.0b013e3181ddfae7", title: "An electromyography analysis of 3 muscles surrounding the shoulder joint during the performance of a chest press exercise at several angles." },
    lauver2016: { cite: "Lauver et al. 2016", journal: "Eur J Sport Sci", pmid: "25799093", doi: "10.1080/17461391.2015.1022605", title: "Influence of bench angle on upper extremity muscular activation during bench press exercise." },
    saeterbakken2011: { cite: "Saeterbakken et al. 2011", journal: "J Sports Sci", pmid: "21225489", doi: "10.1080/02640414.2010.543916", title: "A comparison of muscle activity and 1-RM strength of three chest-press exercises with different stability requirements." },
    andersen2014: { cite: "Andersen et al. 2014", journal: "J Strength Cond Res", pmid: "24662157", doi: "10.1097/JSC.0000000000000232", title: "Effects of grip width on muscle strength and activation in the lat pull-down." },
    coratella2020: { cite: "Coratella et al. 2020", journal: "Int J Environ Res Public Health", pmid: "32824894", doi: "10.3390/ijerph17176015", title: "An Electromyographic Analysis of Lateral Raise Variations and Frontal Raise in Competitive Bodybuilders." },
    reinold2004: { cite: "Reinold et al. 2004", journal: "J Orthop Sports Phys Ther", pmid: "15296366", doi: "10.2519/jospt.2004.34.7.385", title: "Electromyographic analysis of the rotator cuff and deltoid musculature during common shoulder external rotation exercises." },
    fenwick2009: { cite: "Fenwick et al. 2009", journal: "J Strength Cond Res", pmid: "19620925", doi: "10.1519/JSC.0b013e3181b07334", title: "Comparison of different rowing exercises: trunk muscle activation and lumbar spine motion, load, and stiffness." },
    contreras2015: { cite: "Contreras et al. 2015", journal: "J Appl Biomech", pmid: "26214739", doi: "10.1123/jab.2014-0301", title: "A Comparison of Gluteus Maximus, Biceps Femoris, and Vastus Lateralis Electromyographic Activity in the Back Squat and Barbell Hip Thrust Exercises." },
    wilson2012: { cite: "Wilson et al. 2012", journal: "J Strength Cond Res", pmid: "22002517", doi: "10.1519/JSC.0b013e31823a3e2d", title: "Concurrent training: a meta-analysis examining interference of aerobic and resistance exercises." },
    hackett2013: { cite: "Hackett et al. 2013", journal: "J Strength Cond Res", pmid: "23222073", doi: "10.1519/JSC.0b013e31827de07d", title: "The Valsalva maneuver: its effect on intra-abdominal pressure and safety issues during resistance exercise." },
    robinson2024: { cite: "Robinson et al. 2024", journal: "Sports Med", pmid: "38970765", doi: "10.1007/s40279-024-02069-2", title: "Exploring the Dose-Response Relationship Between Estimated Resistance Training Proximity to Failure, Strength Gain, and Muscle Hypertrophy: A Series of Meta-Regressions." },
    schoenfeld2018: { cite: "Schoenfeld et al. 2018", journal: "Eur J Sport Sci", pmid: "29533715", doi: "10.1080/17461391.2018.1447020", title: "Differential effects of attentional focus strategies during long-term resistance training." },
    schoenfeld2015: { cite: "Schoenfeld et al. 2015", journal: "Sports Med", pmid: "25601394", doi: "10.1007/s40279-015-0304-0", title: "Effect of repetition duration during resistance training on muscle hypertrophy: a systematic review and meta-analysis." },
    schoenfeld2016rest: { cite: "Schoenfeld et al. 2016", journal: "J Strength Cond Res", pmid: "26605807", doi: "10.1519/JSC.0000000000001272", title: "Longer Interset Rest Periods Enhance Muscle Strength and Hypertrophy in Resistance-Trained Men." },
    schoenfeld2017vol: { cite: "Schoenfeld et al. 2017", journal: "J Sports Sci", pmid: "27433992", doi: "10.1080/02640414.2016.1210197", title: "Dose-response relationship between weekly resistance training volume and increases in muscle mass: A systematic review and meta-analysis." },
    schoenfeld2017load: { cite: "Schoenfeld et al. 2017", journal: "J Strength Cond Res", pmid: "28834797", doi: "10.1519/JSC.0000000000002200", title: "Strength and Hypertrophy Adaptations Between Low- vs. High-Load Resistance Training: A Systematic Review and Meta-analysis." },
    schoenfeld2019freq: { cite: "Schoenfeld et al. 2019", journal: "J Sports Sci", pmid: "30558493", doi: "10.1080/02640414.2018.1555906", title: "How many times per week should a muscle be trained to maximize muscle hypertrophy? A systematic review and meta-analysis of studies examining the effects of resistance training frequency." },
    morton2018: { cite: "Morton et al. 2018", journal: "Br J Sports Med", pmid: "28698222", doi: "10.1136/bjsports-2017-097608", title: "A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults." },
    lamon2021: { cite: "Lamon et al. 2021", journal: "Physiol Rep", pmid: "33400856", doi: "10.14814/phy2.14660", title: "The effect of acute sleep deprivation on skeletal muscle protein synthesis and the hormonal environment." },
    craven2022: { cite: "Craven et al. 2022", journal: "Sports Med", pmid: "35708888", doi: "10.1007/s40279-022-01706-y", title: "Effects of Acute Sleep Loss on Physical Performance: A Systematic and Meta-Analytical Review." },
    fradkin2010: { cite: "Fradkin et al. 2010", journal: "J Strength Cond Res", pmid: "19996770", doi: "10.1519/JSC.0b013e3181c643a0", title: "Effects of warming-up on physical performance: a systematic review with meta-analysis." },
    acsm2009: { cite: "ACSM position stand 2009", journal: "Med Sci Sports Exerc", pmid: "19204579", doi: "10.1249/MSS.0b013e3181915670", title: "American College of Sports Medicine position stand. Progression models in resistance training for healthy adults." }
  };

  /* ---- Coach cards: one per exercise, keyed by the exact exercise name in GUIDE / DAYS. ----
   * muscles {main, help} | steps[3-6] | cues[3] | fixes [[mistake, fix]] | feel | breath | tempo
   * easier / harder | notes[] (leg day extras) | ev {lvl, text, refs[]} | demo (VIDEOS id) | more[] | lib {src, title, url, kind}
   * ev.lvl: strong = systematic review / meta-analysis on this very question; moderate = controlled trial or
   * lab study on this very question (small samples); limited = indirect (different exercise, EMG only, tiny n);
   * practice = coaching practice, no direct research found. */
  var COACH = {
    /* ================= LEGS (Wed + Fri) - most detailed ================= */
    'Back squat': {
      muscles: { main: 'Quadriceps, glutes', help: 'Adductors (inner thigh), hamstrings, calves, spinal erectors and abs (they hold your torso steady)' },
      steps: [
        'Set the bar in the rack at about mid-chest height and set the safety pins just below the bottom of your squat (see the Leg day primer).',
        'Duck under, set the bar on your upper back (on the shelf of your traps, not on your neck), grip just outside your shoulders, and stand it up. Take 2 steps back, feet about shoulder width, toes turned out 15-30 degrees.',
        'Big breath into your belly, brace your abs like you are about to be tapped in the stomach, and keep the bar still on your back.',
        'Sit down between your hips, knees tracking over your toes, until your thighs are at least parallel (hip crease level with your knees) or as deep as you can keep your back flat and heels down.',
        'Drive the floor away through your whole foot and stand up with your chest and hips rising together. Exhale at the top (or just past the hardest part).',
        'Walk the bar forward into the rack, and only then let go.'
      ],
      cues: ['"Chest up, brace like a punch is coming."', '"Spread the floor with your feet - whole foot stays glued down."', '"Sit between your hips, don\'t fold forward."'],
      fixes: [
        ['Heels lift or you fall forward at the bottom', 'Take the bar lighter, widen your stance a touch, turn toes out, and wear flat shoes (or put 5 lb plates under your heels while you build ankle mobility).'],
        ['Knees cave inward on the way up', 'Think "push your knees out over your little toes". Drop the weight 10-15% until the knees track clean.'],
        ['Hips shoot up first and the lift turns into a good-morning', 'Chest-up cue, and pause 1 second at the bottom. If it keeps happening, go back to goblet squats for two weeks.'],
        ['Cutting depth short', 'Set a box or bench at parallel as a target and lightly touch it. Depth matters more than load (see evidence).']
      ],
      feel: 'Thighs and glutes working hard, a deep burn in the quads by the last 2 reps, heart rate up. You should stop with about 2 clean reps left in the tank. Your back should feel braced and tired, not sharp or pinchy.',
      breath: 'Breathe in and brace before you descend, hold the brace through the bottom, exhale as you pass the hardest point on the way up (or at the top). A brief held breath is normal on heavy sets.',
      tempo: 'About 2-3 seconds down, no bounce, 1 second pause at the bottom, 1 second up.',
      easier: 'Goblet squat to a box, or bodyweight squat to a bench. Use the empty bar and add weight in 5-10 lb jumps.',
      harder: 'Add 5 lb once all sets hit the top of the rep range with 2 reps in reserve. Later: 2-second pause squats, then a 5th set.',
      notes: [
        'Starting weight: empty bar (45 lb) for 2 sets of 8 on day one, then add weight each set until the last rep of a set of 8 looks like you had 3 more in you. That is your working weight.',
        'Your first sets are practice. Film one set from the side on your phone: check your heels stay down and your back stays flat.',
        'Safety pins: always set them. If you get stuck, lower the bar back down slowly onto the pins - you do not need a spotter if the pins are right.',
        'Soreness 1-3 days later in quads and glutes is normal. Pain in the front of the knee or lower back during the lift is not - drop the weight and re-check form.'
      ],
      ev: { lvl: 'moderate', text: 'Deeper squats built more thigh muscle than shallow ones in a 12-week trial (Bloomquist), and full squats grew glutes and adductors more than half squats (Kubo). Knee muscles work hardest at depth, even with lighter loads (Bryanton, 10 trained women). A systematic review agrees full range of motion is better for lower-body growth. Letting knees travel past the toes is fine (it shifts load off the hips and back, Fry, only 7 men tested).', refs: ['bloomquist2013', 'kubo2019', 'schoenfeld2020rom', 'fry2003', 'bryanton2012'] },
      demo: 'my0tLDaWyDU', more: ['GQ5jj_zH2uA', 'gcNh17Ckjgg'],
      lib: { src: 'ExRx.net', title: 'Barbell Squat', url: 'https://exrx.net/WeightExercises/Quadriceps/BBSquat', kind: 'Animated demo + muscle map' }
    },
    'Goblet squat': {
      muscles: { main: 'Quadriceps, glutes', help: 'Adductors, hamstrings, abs, upper back (holding the weight up front)' },
      steps: [
        'Stand tall holding one dumbbell vertically against your chest, hands cupped under the top end, elbows pointing down.',
        'Feet a little wider than your shoulders, toes turned out slightly.',
        'Breathe in, brace, then sit straight down between your knees. Your elbows should travel inside your knees at the bottom.',
        'Go as deep as you can with a flat back and heels flat. Pause for a beat.',
        'Press the floor away and stand tall. Exhale as you rise.'
      ],
      cues: ['"Elbows inside the knees."', '"Sit down, not back."', '"Whole foot stays on the floor."'],
      fixes: [
        ['Leaning forward, dumbbell drifts away from your chest', 'Hug the weight into your breastbone and lead with your chest. Use a lighter bell.'],
        ['Heels come up', 'Widen the stance and turn your toes out a bit, or put small plates under your heels while ankles loosen up.'],
        ['Knees collapse in', 'Push your knees out toward your little toes. Pause at the bottom and push them against your elbows.']
      ],
      feel: 'Quads and glutes burning, upper back and abs holding you up. It should feel like a hard but friendly set, 2 reps in reserve.',
      breath: 'In and brace on the way down, out as you stand.',
      tempo: '2-3 seconds down, 1 second pause, 1 second up.',
      easier: 'Squat to a box or bench. Hold a lighter dumbbell, or no weight with arms out in front.',
      harder: 'Heavier dumbbell, 3-second pause at the bottom, or move on to the back squat.',
      notes: [
        'This is the best way to learn the squat. The weight out front acts as a counterbalance so your torso stays upright.',
        'Starting weight: a 25-35 lb dumbbell for 8-12 reps, so the last 2 reps feel slow.',
        'Use it to practice depth. If you can sit comfortably in the bottom for 10 seconds, your back squat will thank you.'
      ],
      ev: { lvl: 'practice', text: 'Coaching practice, no goblet-specific study found. The general depth findings in the back squat card (full range of motion beats partial for lower-body growth) apply here too.', refs: ['schoenfeld2020rom'] },
      demo: 'MeIiIdhvXT4', more: [],
      lib: { src: 'Muscle & Strength', title: 'Dumbbell Goblet Squat: Video Exercise Guide & Tips', url: 'https://www.muscleandstrength.com/exercises/dumbbell-goblet-squat', kind: 'Video guide with tips' }
    },
    'Dumbbell Romanian deadlift': {
      muscles: { main: 'Hamstrings, glutes', help: 'Spinal erectors (lower back), forearms and grip, lats (keeping the bells close)' },
      steps: [
        'Stand tall holding a dumbbell in each hand in front of your thighs, palms facing you. Feet about hip width, knees slightly bent.',
        'Push your hips straight back like you are closing a car door with your butt. Keep the dumbbells brushing your thighs and shins.',
        'Keep your back flat and your neck in line with your spine. Stop when you feel a strong stretch in the back of your thighs, usually just below the knees.',
        'Squeeze your glutes and drive your hips forward to stand tall. Do not lean back at the top.',
        'Reset your brace and repeat.'
      ],
      cues: ['"Hips back, not down."', '"Drag the dumbbells down your legs."', '"Feel it in the hamstrings, not the back."'],
      fixes: [
        ['Back rounds as you lower', 'You went too low or too heavy. Stop where your hamstrings stretch and your back is still flat. Lighter weight.'],
        ['Turns into a squat (knees bend a lot)', 'Keep knees soft, shins near vertical. The motion is hips back.'],
        ['Bells drift out in front', 'Think "pull the bells back into your legs" with your lats tight.'],
        ['Feeling it in the lower back only', 'Smaller range, brace harder, and squeeze the glutes at the top. Try the cable pull-through to feel the hinge first.']
      ],
      feel: 'A deep stretch and burn in the hamstrings and glutes. Lower back works to stay flat but should not pinch. Grip tires first on heavy sets.',
      breath: 'In and brace at the top, hold on the way down, out as you drive hips forward.',
      tempo: '3 seconds down, 1 second at the stretch, 1 second up.',
      easier: 'Lighter dumbbells, or the cable pull-through. Lower only to just below the knees.',
      harder: 'Heavier bells, 3-4 second lowering, or a barbell RDL. Use straps if grip limits you.',
      notes: [
        'Starting weight: 20-30 lb in each hand for 10 reps. The hinge is a skill: go light until it feels automatic.',
        'Hamstrings are at their longest at the bottom of this lift, which is where they grow best (see evidence on leg curls).',
        'Do a hinge drill first: stand a foot from a wall, push your butt back to tap it, shins vertical.'
      ],
      ev: { lvl: 'limited', text: 'No study of the dumbbell RDL itself. Indirect support: hamstrings grew more when trained at a long muscle length (seated leg curl vs prone), which is the stretched position you hit at the bottom of the RDL.', refs: ['maeo2021'] },
      demo: 'FQKfr1YDhEk', more: ['hQgFixeXdZo'],
      lib: { src: 'ExRx.net', title: 'Romanian Deadlift (barbell version)', url: 'https://exrx.net/WeightExercises/OlympicLifts/RomanianDeadlift', kind: 'Animated demo + muscle map (barbell; same hinge)' }
    },
    'Leg curl machine': {
      muscles: { main: 'Hamstrings (biceps femoris, semitendinosus, semimembranosus)', help: 'Calves (gastrocnemius), glutes holding your hips down' },
      steps: [
        'Adjust the seat so your knees line up with the machine pivot and the pad sits just above your heels (above the ankle, on your lower calf).',
        'Set the thigh pad snug so your hips stay glued to the seat.',
        'Grip the handles, sit tall, and curl the pad down and back by bending your knees.',
        'Squeeze your hamstrings at the bottom for 1 second.',
        'Let the pad rise slowly all the way back until your legs are almost straight, keeping tension on the stack.'
      ],
      cues: ['"Hips stay in the seat."', '"Curl your heels to your glutes."', '"Slow on the way up, don\'t let the stack crash."'],
      fixes: [
        ['Hips lift or you arch your back to cheat', 'Lower the weight, tighten the thigh pad, and hold the handles.'],
        ['Swinging the weight', 'Take 2 seconds on the curl and 3 on the return.'],
        ['Cutting the stretch short', 'Fully extend each rep: the stretched part is where the hamstrings grow best.']
      ],
      feel: 'A strong burn along the back of your thighs. Cramping is a sign to lower the weight or slow down. Stop with about 2 reps left.',
      breath: 'Exhale as you curl, inhale as the pad returns.',
      tempo: '1 second curl, 1 second squeeze, 3 seconds return.',
      easier: 'Lighter weight, or one leg at a time with the same setup.',
      harder: 'Add weight, pause 2 seconds at the bottom, or do slow 4-second returns.',
      notes: [
        'Use the seated machine if your gym has both. The seated version trains the hamstrings stretched at the hip.',
        'Starting weight: pick a load you can curl for 12 clean reps with a 3-second return, usually 40-60 lb.'
      ],
      ev: { lvl: 'moderate', text: 'In a 12-week MRI study, seated leg curls grew the hamstrings more (+14%) than prone leg curls (+9%) in 20 adults, supporting training the hamstrings in a stretched position. Trial used the seated machine, so use that one if you have a choice.', refs: ['maeo2021'] },
      demo: 't9sTSr-JYSs', more: [],
      lib: { src: 'ExRx.net', title: 'Lever Seated Leg Curl', url: 'https://exrx.net/WeightExercises/Hamstrings/LVSeatedLegCurl', kind: 'Animated demo + muscle map' }
    },
    'Dumbbell walking lunges': {
      muscles: { main: 'Quadriceps, glutes', help: 'Hamstrings, adductors, calves, abs and the small hip muscles that stop you wobbling' },
      steps: [
        'Hold a dumbbell in each hand at your sides, stand tall with feet hip width.',
        'Take a long step forward (about 2-3 feet) and plant the whole foot.',
        'Lower your back knee straight down toward the floor until your front thigh is about parallel. Keep your torso tall or slightly forward.',
        'Push through the front foot (mid-foot and heel) and bring the back leg forward into the next step.',
        'Alternate legs for the set. 10 steps per leg is 20 total.'
      ],
      cues: ['"Drop the back knee straight down."', '"Long step, tall chest."', '"Push the floor away with your front foot."'],
      fixes: [
        ['Short steps and the front knee shoots far over the toes', 'Step longer so your front shin stays closer to vertical.'],
        ['Wobbling side to side', 'Narrow your steps slightly (not on a tightrope) and look at a spot ahead. Lighter weight.'],
        ['Front knee caves inward', 'Push your knee out over the middle toe and slow down.'],
        ['Rushing', 'One steady beat per step. If you cannot control it, do stationary split squats.']
      ],
      feel: 'Quads and glutes burn hard, plus a balance challenge. Legs will feel heavy on the last reps. 2 reps in reserve, and no sharp knee pain.',
      breath: 'Inhale as you step, exhale as you drive up.',
      tempo: '2 seconds down, quick but controlled drive up.',
      easier: 'Bodyweight only, reverse lunges in place, or split squats holding a rack for balance.',
      harder: 'Heavier dumbbells, a 1-second pause at the bottom, or a longer walk.',
      notes: [
        'Starting weight: a pair of 15-25 lb dumbbells. Balance runs out before leg strength does, so go lighter than you think.',
        'A slightly forward trunk shifts work to the glutes and hamstrings; an upright trunk keeps it on the quads.',
        'Need room: you need about 20 feet of clear floor. Turn around and walk back if the gym is tight.'
      ],
      ev: { lvl: 'limited', text: 'Ten healthy adults: leaning the trunk forward in a lunge increased glute and hamstring muscle activity and hip work, while staying upright did not (Farrokhi). Small sample and activity, not growth.', refs: ['farrokhi2008'] },
      demo: 'Pbmj6xPo-Hw', more: ['I34ysEkPK7w'],
      lib: { src: 'Muscle & Strength', title: 'Dumbbell Walking Lunge: Video Exercise Guide & Tips', url: 'https://www.muscleandstrength.com/exercises/dumbbell-walking-lunge.html', kind: 'Video guide with tips' }
    },
    'Cable pull-through': {
      muscles: { main: 'Glutes, hamstrings', help: 'Spinal erectors, abs, forearms' },
      steps: [
        'Set the cable at the lowest position with a rope attached. Face away from the stack, straddle the cable, and take the rope between your legs with both hands.',
        'Walk forward a few steps until the cable is tight. Feet wider than hips, soft knees, chest tall.',
        'Push your hips straight back and let the cable pull your hands between your legs. Back stays flat.',
        'When your hamstrings are stretched (torso near parallel), drive your hips forward and squeeze your glutes to stand tall.',
        'Keep your arms long like ropes. The hips do the work.'
      ],
      cues: ['"Hips back like closing a door."', '"Arms are just hooks."', '"Squeeze the glutes at the top and stop - don\'t lean back."'],
      fixes: [
        ['Squatting it (hips go down, not back)', 'Keep shins vertical and think of pushing your butt to a wall behind you.'],
        ['Pulling with the arms', 'Keep elbows straight and let your hands hang.'],
        ['Leaning back at the top', 'Finish tall with ribs down. Stop when your glutes are squeezed.']
      ],
      feel: 'A stretch in the hamstrings on the way back and a hard glute squeeze on the way up. Little or no lower-back work.',
      breath: 'In and brace as you hinge back, out as you drive up.',
      tempo: '2-3 seconds back, 1 second up, 1 second squeeze.',
      easier: 'Lighter stack, smaller hinge, or practice the hinge with a dowel or wall first.',
      harder: 'Add weight, a 2-second squeeze at the top, or a 3-second lowering.',
      notes: [
        'This is your hinge teacher. If the dumbbell RDL feels awkward, practice the hinge here with a light stack first.',
        'Starting weight: usually 30-50 lb on the stack for 12 reps.'
      ],
      ev: { lvl: 'limited', text: 'No pull-through-specific study found. Indirect: a hip-thrust-style hip extension produced more glute and hamstring activity than the back squat in 13 trained women (Contreras), which supports adding a direct hip-extension exercise.', refs: ['contreras2015'] },
      demo: 'pv8e6OSyETE', more: ['DbSF7ipBh5Y'],
      lib: { src: 'The White Coat Trainer', title: 'How to do Cable Pull-Throughs Correctly & Safely', url: 'https://whitecoattrainer.com/blog/cable-pull-through', kind: 'Written guide + video (two MDs and certified trainers)' }
    },
    'Calf raises': {
      muscles: { main: 'Calves (gastrocnemius and soleus)', help: 'Foot and ankle stabilizers' },
      steps: [
        'Stand with the balls of your feet on a step or the machine platform, heels hanging off. Hold something for balance or use the machine pads.',
        'Keep your legs straight (a soft knee is fine) and rise as high onto your toes as you can.',
        'Squeeze at the top for 1 second.',
        'Lower slowly until your heels drop below the step and you feel a deep calf stretch. Pause 1 second.',
        'Press up again without bouncing.'
      ],
      cues: ['"Up on the big toe."', '"Full stretch at the bottom."', '"Pause at the top, pause at the bottom."'],
      fixes: [
        ['Bouncing out of the bottom', 'Pause 1 second in the stretch. Bouncing uses the tendon instead of the muscle.'],
        ['Short reps', 'Go full range, up high and down deep.'],
        ['Rolling to the outside of your feet', 'Push through the big toe knuckle and keep your ankles straight.']
      ],
      feel: 'Calves burn and pump, sometimes cramp-like at the end. Calves are stubborn: that deep burn at 12-15 reps is what you want.',
      breath: 'Exhale up, inhale down.',
      tempo: '1 second up, 1 second squeeze, 2 seconds down, 1 second stretch.',
      easier: 'Two legs, bodyweight, on the floor.',
      harder: 'Add dumbbells, go one leg at a time, or slow to a 3-second lowering.',
      notes: ['Calves recover quickly and can take high reps: 15 with a hard stretch beats 8 bounced reps.'],
      ev: { lvl: 'moderate', text: 'In a 12-week MRI study of 14 untrained adults, standing (straight-knee) calf raises grew the calf muscles much more than seated (bent-knee) raises: about +12% vs +2% in the outer calf muscle. If your gym has a standing option, use it.', refs: ['kinoshita2023'] },
      demo: 'k8ipHzKeAkQ', more: ['SVtg-1loH4c'],
      lib: { src: 'ExRx.net', title: 'Dumbbell Standing Calf Raise', url: 'https://exrx.net/WeightExercises/Gastrocnemius/DBStandingCalfRaise', kind: 'Animated demo + muscle map' }
    },
    /* ================= PUSH ================= */
    'Chest press machine': {
      muscles: { main: 'Chest (pectoralis major)', help: 'Front shoulders, triceps' },
      steps: [
        'Set the seat so the handles sit level with the middle of your chest.',
        'Sit back with your shoulder blades pinched together and pressed into the pad, feet flat.',
        'Press the handles out until your arms are nearly straight, without locking your elbows.',
        'Pause briefly, then let the handles come back slowly until you feel a stretch across your chest.'
      ],
      cues: ['"Shoulder blades back and down, chest proud."', '"Push the handles apart as you press."', '"Slow on the way back."'],
      fixes: [
        ['Shoulders roll forward at the top', 'Keep your back in the pad and stop the press just short of full reach.'],
        ['Seat too low or high', 'Handles should line up with mid-chest. Adjust before your first set.'],
        ['Letting the stack slam', 'Control the return for 2-3 seconds. Do not let the plates touch between reps.']
      ],
      feel: 'Chest working, front of the shoulders and triceps helping. Last 2 reps slow but smooth, nothing pinching in the shoulder joint.',
      breath: 'Exhale as you press, inhale as you return.',
      tempo: '1 second press, 2-3 seconds return.',
      easier: 'Lighter pin, partial range.',
      harder: 'More weight, 1-second pause at full stretch, or single-arm presses.',
      ev: { lvl: 'limited', text: 'Not machine-specific. In 12 trained men, a Smith machine press let them lift about 14% more than dumbbells with similar chest and front-delt activity. Stable presses let you load the chest hard with less balance demand.', refs: ['saeterbakken2011'] },
      demo: 'xUm0BiZCWlQ', more: [],
      lib: { src: 'ExRx.net', title: 'Lever Chest Press', url: 'https://exrx.net/WeightExercises/PectoralSternal/LVChestPress', kind: 'Animated demo + muscle map' }
    },
    'Incline dumbbell press': {
      muscles: { main: 'Upper chest (clavicular pec major)', help: 'Front shoulders, triceps' },
      steps: [
        'Set the bench to about 30 degrees. Sit with the dumbbells on your thighs, then kick them up one at a time as you lie back.',
        'Pinch your shoulder blades together and keep them there. Feet flat.',
        'Press the dumbbells up over your upper chest, bringing them slightly together at the top.',
        'Lower with control until your elbows are just below the bench line and about 45 degrees from your body.'
      ],
      cues: ['"Elbows 45 degrees, not flared."', '"Press up and together."', '"Shoulder blades pinned to the bench."'],
      fixes: [
        ['Bench too steep (turns into a shoulder press)', 'Keep it around 30 degrees.'],
        ['Elbows flared straight out', 'Tuck to about 45 degrees. Wrists stay stacked over elbows.'],
        ['Bouncing off the bottom', 'Pause for 1 second at the stretch.']
      ],
      feel: 'Upper chest and front of shoulders burning, triceps helping. 2 reps in reserve. Shoulders stay stable, no pinching.',
      breath: 'In on the way down, out as you press.',
      tempo: '2 seconds down, 1 second up.',
      easier: 'Lighter dumbbells, or the machine press.',
      harder: 'Heavier dumbbells, 2-second pause at the bottom.',
      ev: { lvl: 'moderate', text: 'In 15 men, the upper chest was activated more at 44-56 degrees than flat (Trebs); another 14-man study found the upper chest peaked at 30-45 degrees mid-rep (Lauver). Muscle-activity studies, not growth studies. Both suggest using flat and incline work.', refs: ['trebs2010', 'lauver2016'] },
      demo: '8iPEnn-ltC8', more: [],
      lib: { src: 'ExRx.net', title: 'Dumbbell Incline Bench Press', url: 'https://exrx.net/WeightExercises/PectoralClavicular/DBInclineBenchPress', kind: 'Animated demo + muscle map' }
    },
    'Dumbbell bench press': {
      muscles: { main: 'Chest (pectoralis major)', help: 'Front shoulders, triceps, biceps (stabilizing)' },
      steps: [
        'Sit on the bench with the dumbbells on your thighs, kick them up and lie back. Feet flat.',
        'Pinch your shoulder blades together and keep a slight arch in your upper back.',
        'Press the dumbbells up until your arms are straight over your chest.',
        'Lower slowly until your elbows are just below the bench and your forearms are vertical.'
      ],
      cues: ['"Squeeze the dumbbells like you\'re crushing them."', '"Forearms vertical."', '"Chest up, shoulders back."'],
      fixes: [
        ['Elbows flare to 90 degrees', 'Tuck to about 45 degrees.'],
        ['Dumbbells drift in different directions', 'Lighter weight and slower reps. Watch the bells in the mirror.'],
        ['Rushing the way down', 'Count 2-3 seconds down.']
      ],
      feel: 'Chest working with a good stretch at the bottom, triceps and shoulders helping. Last 2 reps slow but under control.',
      breath: 'In on the way down, out as you press.',
      tempo: '2-3 seconds down, 1 second up.',
      easier: 'Machine chest press or a lighter dumbbell.',
      harder: 'Heavier dumbbells, pause 1-2 seconds at the bottom.',
      ev: { lvl: 'moderate', text: 'Chest and front-delt activity were similar across Smith machine, barbell and dumbbell presses in 12 trained men. Dumbbells needed about 14-17% less load and involved the biceps more because of the stability demand (Saeterbakken).', refs: ['saeterbakken2011'] },
      demo: 'QsYre__-aro', more: [],
      lib: { src: 'ExRx.net', title: 'Dumbbell Bench Press', url: 'https://exrx.net/WeightExercises/PectoralSternal/DBBenchPress', kind: 'Animated demo + muscle map' }
    },
    'Cable chest fly': {
      muscles: { main: 'Chest (pectoralis major)', help: 'Front shoulders, biceps (stabilizing)' },
      steps: [
        'Set both pulleys at about chest height. Take a handle in each hand and step forward to a staggered stance.',
        'Lean slightly forward with a small bend in your elbows that stays fixed.',
        'Sweep your arms forward and together in a wide hugging arc until the handles meet in front of your chest.',
        'Squeeze 1 second, then open slowly until you feel a stretch across your chest.'
      ],
      cues: ['"Hug a big tree."', '"Elbows stay softly bent."', '"Slow stretch, strong squeeze."'],
      fixes: [
        ['Turning it into a press (elbows bend and straighten)', 'Lock the elbow angle, lighter weight.'],
        ['Overstretching at the back', 'Stop when your hands are in line with your shoulders.'],
        ['Using momentum from your legs', 'Brace your core and stay planted.']
      ],
      feel: 'A deep stretch and burn across the chest. It is a light-weight, high-effort exercise: do not chase heavy loads.',
      breath: 'Inhale as you open, exhale as you squeeze.',
      tempo: '1 second in, 1 second squeeze, 3 seconds out.',
      easier: 'Lighter weight, or use the chest press machine.',
      harder: 'Hold the squeeze for 2 seconds, slow the opening phase.',
      ev: { lvl: 'practice', text: 'Coaching practice. No direct hypertrophy study to cite for cable flys specifically. Keeps tension on the chest in the stretched position, which fits the long-muscle-length research seen elsewhere in this app.', refs: [] },
      demo: 'I-Ue34qLxc4', more: [],
      lib: { src: 'ExRx.net', title: 'Cable Isolateral Standing Fly', url: 'https://exrx.net/WeightExercises/PectoralSternal/CBStandingFly', kind: 'Animated demo + muscle map' }
    },
    'Cable crossover': {
      muscles: { main: 'Chest (pectoralis major), especially the lower and inner chest', help: 'Front shoulders, biceps and abs (stabilizing)' },
      steps: [
        'Set both pulleys high. Take a handle in each hand and step forward into a staggered stance.',
        'Lean forward slightly with a soft bend in your elbows.',
        'Sweep your hands down and across until they meet in front of your hips or lower chest.',
        'Squeeze 1 second, then return slowly until you feel a stretch.'
      ],
      cues: ['"Hands meet in front of your belt."', '"Soft elbows, no pressing."', '"Chest proud, ribs down."'],
      fixes: [
        ['Shrugging the shoulders', 'Keep your shoulders down and away from your ears.'],
        ['Bending and straightening the elbows', 'Fix the elbow angle and lighten the weight.'],
        ['Swinging your torso', 'Hips back, brace your abs, slow the reps.']
      ],
      feel: 'Squeeze through the lower chest and inner chest, shoulders stay quiet. A burn across the middle of the chest.',
      breath: 'Exhale as you squeeze, inhale as you return.',
      tempo: '1 second in, 1 second squeeze, 3 seconds back.',
      easier: 'Lighter weight, or keep one foot forward for balance.',
      harder: '2-second hold at the squeeze, or one arm at a time.',
      ev: { lvl: 'practice', text: 'Coaching practice. Not studied directly for growth. Chosen as a stretch-and-squeeze finisher for the chest.', refs: [] },
      demo: 'taI4XduLpTk', more: [],
      lib: { src: 'ExRx.net', title: 'Cable Isolateral Standing Fly (closest page)', url: 'https://exrx.net/WeightExercises/PectoralSternal/CBStandingFly', kind: 'Animated demo + muscle map (related variation)' }
    },
    'Seated dumbbell shoulder press': {
      muscles: { main: 'Front and side shoulders (deltoids)', help: 'Triceps, upper chest, upper traps' },
      steps: [
        'Set the bench upright (or a 80-90 degree back pad). Sit tall with the dumbbells at shoulder height, palms forward.',
        'Brace your core and keep your ribs down.',
        'Press the dumbbells straight up until your arms are nearly straight, with the bells meeting over your head.',
        'Lower slowly back to shoulder height with your forearms vertical.'
      ],
      cues: ['"Ribs down, don\'t arch."', '"Stack wrist over elbow."', '"Press the ceiling away."'],
      fixes: [
        ['Arching your lower back', 'Squeeze your glutes and keep ribs down. Lighter weight.'],
        ['Elbows flaring too far forward or back', 'Elbows slightly in front of your body (scapular plane).'],
        ['Short range', 'Lower to ear level every rep.']
      ],
      feel: 'Shoulders working hard, triceps helping, top of the chest assisting. Should not pinch at the top of your shoulder.',
      breath: 'Exhale as you press, inhale as you lower.',
      tempo: '1 second up, 2 seconds down.',
      easier: 'Lighter bells, or a shoulder press machine.',
      harder: 'Heavier bells, 2-second pause at the bottom.',
      ev: { lvl: 'practice', text: 'Coaching practice. A standard shoulder builder with no single study to cite for dumbbell vs other versions.', refs: [] },
      demo: 'rO_iEImwHyo', more: [],
      lib: { src: 'ExRx.net', title: 'Dumbbell Shoulder Press', url: 'https://exrx.net/WeightExercises/DeltoidAnterior/DBShoulderPress', kind: 'Animated demo + muscle map' }
    },
    'Dumbbell Arnold press': {
      muscles: { main: 'Front and side shoulders (deltoids)', help: 'Triceps, upper chest, upper traps' },
      steps: [
        'Sit tall holding the dumbbells in front of your chest, palms facing you, elbows bent.',
        'As you press up, rotate your palms to face forward.',
        'Finish with your arms nearly straight over your shoulders.',
        'Lower by rotating your palms back toward you until the dumbbells are in front of your chest again.'
      ],
      cues: ['"Rotate as you rise."', '"Ribs down."', '"Smooth, no jerks."'],
      fixes: [
        ['Rushing the rotation', 'Slow down and coordinate the turn with the press.'],
        ['Arching the back', 'Brace your abs and lower the weight.'],
        ['Going too heavy', 'This press is lighter than the standard version, so drop 10-20%.']
      ],
      feel: 'Shoulders working through the whole range. Starts at the front, shifts toward the side as you press.',
      breath: 'Exhale on the press, inhale on the way down.',
      tempo: '1-2 seconds up, 2-3 seconds down.',
      easier: 'Standard seated dumbbell press.',
      harder: 'Heavier bells, slower rotation.',
      ev: { lvl: 'practice', text: 'Coaching practice. No study isolates the Arnold press as better or worse than standard presses.', refs: [] },
      demo: '3ml7BH7mNwQ', more: [],
      lib: { src: 'ExRx.net', title: 'Dumbbell Arnold Press', url: 'https://exrx.net/WeightExercises/DeltoidAnterior/DBArnoldPress', kind: 'Animated demo + muscle map' }
    },
    'Cable lateral raise': {
      muscles: { main: 'Side shoulder (lateral deltoid)', help: 'Upper traps, supraspinatus' },
      steps: [
        'Set a pulley low. Stand side-on to the stack and hold the handle with the far hand, across your body.',
        'Keep a slight bend in your elbow and a tall chest.',
        'Raise your arm out to the side to about shoulder height, thumb leading (like pouring a jug).',
        'Lower slowly under control.'
      ],
      cues: ['"Lead with the elbow."', '"Shoulders down, away from the ears."', '"Raise to shoulder height, no higher."'],
      fixes: [
        ['Shrugging the traps', 'Lighter weight, think "push your elbow out".'],
        ['Swinging the body', 'Brace your abs, slow down, lower the load.'],
        ['Going above shoulder height', 'Stop at shoulder height.']
      ],
      feel: 'A burn on the outside of the shoulder. The weight is tiny - this is normal and correct.',
      breath: 'Exhale up, inhale down.',
      tempo: '1 second up, 3 seconds down.',
      easier: 'Lighter weight, or sit down.',
      harder: 'Pause 1 second at the top, or slow the lowering.',
      ev: { lvl: 'limited', text: 'In 10 competitive bodybuilders, the side shoulder was most active when the arm was raised with a neutral thumb-forward grip, more than with the arm turned out. Activity study only, 10 people.', refs: ['coratella2020'] },
      demo: 'Z5FA9aq3L6A', more: [],
      lib: { src: 'ExRx.net', title: 'Cable Isolateral Lateral Raise', url: 'https://exrx.net/WeightExercises/DeltoidLateral/CBLateralRaise', kind: 'Animated demo + muscle map' }
    },
    'Cable front raise': {
      muscles: { main: 'Front shoulder (anterior deltoid)', help: 'Upper chest, upper traps' },
      steps: [
        'Set a pulley low. Stand facing away from the stack and hold the handle in front of your thigh (or through your legs).',
        'Soft elbow, tall posture, ribs down.',
        'Raise the handle in front of you to about shoulder height.',
        'Lower slowly.'
      ],
      cues: ['"Lift to eye level, no higher."', '"Ribs down, don\'t lean back."', '"Slow on the way down."'],
      fixes: [
        ['Leaning back to swing the weight up', 'Lighter weight, brace your abs.'],
        ['Going above shoulder height', 'Stop at shoulder height.'],
        ['Shrugging', 'Keep your shoulders down.']
      ],
      feel: 'A burn in the front of the shoulder. Keep it light.',
      breath: 'Exhale up, inhale down.',
      tempo: '1 second up, 3 seconds down.',
      easier: 'Lighter weight, or alternate arms.',
      harder: 'Slow lowering, 1-second pause at the top.',
      ev: { lvl: 'limited', text: 'In 10 competitive bodybuilders, the front raise mainly activated the front deltoid and the chest (Coratella). Activity study only, 10 people. Because presses already hit the front delts, count this as optional.', refs: ['coratella2020'] },
      demo: 'vtH93qBItdk', more: [],
      lib: { src: 'ExRx.net', title: 'Cable One Arm Front Raise', url: 'https://exrx.net/WeightExercises/DeltoidAnterior/CBFrontRaise', kind: 'Animated demo + muscle map' }
    },
    'Rope pushdown': {
      muscles: { main: 'Triceps (all three heads)', help: 'Forearms, abs (stabilizing)' },
      steps: [
        'Set the pulley high and attach the rope. Stand close, elbows tucked at your sides.',
        'Start with your hands at about chest height and elbows bent to 90 degrees or more.',
        'Press the rope down until your arms are straight, spreading the ends apart at the bottom.',
        'Squeeze the triceps, then let the rope rise slowly until your forearms are back at 90 degrees.'
      ],
      cues: ['"Elbows pinned to your ribs."', '"Spread the rope at the bottom."', '"Slow and controlled on the way up."'],
      fixes: [
        ['Elbows swing forward and back', 'Lock your elbows to your sides and lower the weight.'],
        ['Leaning over the stack', 'Stay tall and keep your torso still.'],
        ['Letting the stack pull your arms up fast', 'Take 2-3 seconds on the way up.']
      ],
      feel: 'A strong burn along the back of the arm. Elbows should feel fine.',
      breath: 'Exhale as you push down, inhale as you return.',
      tempo: '1 second down, 1 second squeeze, 2-3 seconds up.',
      easier: 'Lighter weight, or a straight bar.',
      harder: 'Hold the squeeze for 2 seconds, or drop sets.',
      ev: { lvl: 'practice', text: 'Coaching practice for this exact movement. Related research suggests overhead extensions grow the triceps more than pushdown-style (arm at your side) extensions (see the next card), so pair it with the overhead extension.', refs: ['maeo2023'] },
      demo: 'vB5OHsJ3EME', more: [],
      lib: { src: 'ExRx.net', title: 'Cable Pushdown', url: 'https://exrx.net/WeightExercises/Triceps/CBPushdown', kind: 'Animated demo + muscle map' }
    },
    'Overhead cable triceps extension': {
      muscles: { main: 'Triceps, especially the long head', help: 'Forearms, abs (stabilizing)' },
      steps: [
        'Set a pulley at about chest height or higher with a rope. Face away from the stack, take the rope with both hands behind your head, and stagger your feet.',
        'Elbows point up and forward and stay close to your head.',
        'Straighten your arms until your hands are over your head, spreading the rope slightly.',
        'Bend your elbows slowly back to a deep stretch behind your head.'
      ],
      cues: ['"Elbows stay pointing forward."', '"Stretch deep, then lock out."', '"Ribs down, no arching."'],
      fixes: [
        ['Elbows flare out', 'Keep them in line with your ears and pointing forward.'],
        ['Arching your lower back', 'Brace your abs, ribs down, lean slightly forward.'],
        ['Using momentum', 'Lighter weight, slow lowering.']
      ],
      feel: 'A strong stretch and burn on the back of the upper arm. Weights are light compared to pushdowns, that is normal.',
      breath: 'Exhale as you extend, inhale as you lower.',
      tempo: '1 second up, 3 seconds down with a stretch.',
      easier: 'Lighter weight, or a seated version with back support.',
      harder: 'Pause 1 second in the stretched position.',
      ev: { lvl: 'moderate', text: 'In 21 adults over 12 weeks, one arm trained overhead and the other with the arm at the side: overhead gained more triceps muscle (+20% vs +14% whole triceps, +29% vs +20% in the long head) even with lighter loads (Maeo 2023, MRI).', refs: ['maeo2023'] },
      demo: '1u18yJELsh0', more: [],
      lib: { src: 'ExRx.net', title: 'Cable Triceps Extension (with rope)', url: 'https://exrx.net/WeightExercises/Triceps/CBStandingTricepsExtensionRope', kind: 'Animated demo + muscle map' }
    },
    /* ================= PULL ================= */
    'Seated cable row': {
      muscles: { main: 'Mid-back (lats, rhomboids, mid traps)', help: 'Rear shoulders, biceps, forearms, lower back (holding posture)' },
      steps: [
        'Sit with your feet on the platform and knees slightly bent. Grab the handle and sit tall with your chest up.',
        'Start with your arms straight and shoulders slightly forward, without rounding your back.',
        'Pull the handle to your lower ribs, driving your elbows back and squeezing your shoulder blades together.',
        'Pause, then let the handle return slowly until your arms are straight and you feel a stretch in the back.'
      ],
      cues: ['"Elbows to your back pockets."', '"Chest tall, no rocking."', '"Squeeze your shoulder blades, then stretch."'],
      fixes: [
        ['Rocking your torso for momentum', 'Lighter weight, brace your abs, keep your torso still.'],
        ['Shrugging up toward the ears', 'Pull your shoulders down and back before each rep.'],
        ['Rounding the lower back at the stretch', 'Stop the stretch where you can stay tall.']
      ],
      feel: 'Mid-back squeezing, biceps and forearms assisting. If your biceps burn first, think elbows back, not hands back.',
      breath: 'Exhale as you pull, inhale as you return.',
      tempo: '1 second pull, 1 second squeeze, 2-3 seconds back.',
      easier: 'Lighter weight, or the chest-supported dumbbell row.',
      harder: '2-second pause at the squeeze, or heavier weight with strict form.',
      ev: { lvl: 'practice', text: 'Coaching practice. A standard back builder with no single study to cite for the seated cable row specifically.', refs: [] },
      demo: 'GZbfZ033f74', more: [],
      lib: { src: 'ExRx.net', title: 'Cable Seated Row', url: 'https://exrx.net/WeightExercises/BackGeneral/CBSeatedRow', kind: 'Animated demo + muscle map' }
    },
    'Wide-grip seated cable row': {
      muscles: { main: 'Upper and mid back (rhomboids, mid and lower traps, lats)', help: 'Rear shoulders, biceps' },
      steps: [
        'Attach a wide bar. Sit tall with your feet braced and knees slightly bent.',
        'Grip the bar wider than shoulder width, arms straight and chest up.',
        'Pull the bar toward your lower chest and drive your elbows out and back.',
        'Squeeze your shoulder blades together, then return slowly.'
      ],
      cues: ['"Elbows wide and back."', '"Chest to the bar."', '"No rocking."'],
      fixes: [
        ['Pulling with the arms only', 'Think elbows back first, then bend.'],
        ['Rounded upper back', 'Tall chest, shoulders down.'],
        ['Jerking the weight', 'Lighter, smoother, pause at the squeeze.']
      ],
      feel: 'Squeeze between the shoulder blades, upper-back burn, rear shoulders assisting.',
      breath: 'Exhale on the pull, inhale on the return.',
      tempo: '1 second pull, 1 second squeeze, 2-3 seconds back.',
      easier: 'Lighter weight, narrower grip.',
      harder: '2-second pause at the squeeze, slower return.',
      ev: { lvl: 'practice', text: 'Coaching practice. No study comparing wide vs narrow row grips for growth found.', refs: [] },
      demo: 'YKAeU55CkVk', more: [],
      lib: { src: 'ExRx.net', title: 'Cable Wide Grip Seated Row', url: 'https://exrx.net/WeightExercises/BackGeneral/CBWideGripSeatedRow', kind: 'Animated demo + muscle map' }
    },
    'Cable lat pulldown': {
      muscles: { main: 'Lats (latissimus dorsi)', help: 'Biceps, rear shoulders, mid back, forearms' },
      steps: [
        'Adjust the thigh pad so your legs are locked in. Grab the bar a bit wider than shoulder width, palms forward.',
        'Sit tall, lean back just slightly, and start with your arms straight.',
        'Pull your elbows down toward your sides until the bar reaches your upper chest.',
        'Squeeze your lats, then let the bar rise slowly until your arms are straight again.'
      ],
      cues: ['"Elbows to your pockets."', '"Chest up to meet the bar."', '"Don\'t let the stack pull you up."'],
      fixes: [
        ['Leaning way back and using your body weight', 'Sit upright with a slight lean only.'],
        ['Pulling behind the neck', 'Pull to the front, to your upper chest.'],
        ['Shrugging and pulling with the arms', 'Think elbows down, not hands down.']
      ],
      feel: 'Wide pull and burn along the sides of the back. Biceps assist but should not burn first.',
      breath: 'Exhale as you pull, inhale as you return.',
      tempo: '1 second down, 1 second squeeze, 3 seconds up.',
      easier: 'Lighter weight, or an assisted version.',
      harder: 'Heavier weight, pause at the bottom, or slow the return.',
      ev: { lvl: 'moderate', text: 'In 15 men, wide, medium and narrow grips gave similar lat activity; wide actually let them lift slightly less than narrow or medium (Andersen). No need to go extra wide: shoulder-width-plus is fine.', refs: ['andersen2014'] },
      demo: 'AOpi-p0cJkc', more: [],
      lib: { src: 'ExRx.net', title: 'Cable Pulldown', url: 'https://exrx.net/WeightExercises/LatissimusDorsi/CBFrontPulldown', kind: 'Animated demo + muscle map' }
    },
    'One-arm dumbbell row': {
      muscles: { main: 'Lats and mid back', help: 'Rear shoulder, biceps, forearm and grip' },
      steps: [
        'Place one hand and the same-side knee on a bench, with your other foot on the floor. Back flat, a dumbbell in your free hand.',
        'Let the dumbbell hang straight below your shoulder with your arm long.',
        'Pull the dumbbell toward your hip, driving your elbow past your ribs.',
        'Pause, then lower slowly to a full stretch.'
      ],
      cues: ['"Row to your hip, not your chest."', '"Keep your hips level."', '"Slow stretch at the bottom."'],
      fixes: [
        ['Twisting the torso to swing the weight', 'Keep your shoulders level and lighter weight.'],
        ['Pulling too high toward the chest', 'Row toward your hip pocket.'],
        ['Rounding the back', 'Flat back, eyes down at the bench.']
      ],
      feel: 'Lat burning on the working side, plus some grip fatigue. Core resists twisting. 2 reps in reserve.',
      breath: 'Exhale as you row, inhale as you lower.',
      tempo: '1 second up, 1 second squeeze, 2-3 seconds down.',
      easier: 'Lighter weight, or the chest-supported row.',
      harder: 'Heavier dumbbell, pause at the top, slower lowering.',
      ev: { lvl: 'practice', text: 'Coaching practice. Related lab work: a standing one-arm cable row mostly challenged the trunk against twisting (Fenwick, 7 men), which is why the cue is hips and shoulders square.', refs: ['fenwick2009'] },
      demo: 'dFzUjzfih7k', more: [],
      lib: { src: 'Muscle & Strength', title: 'One Arm Dumbbell Row: Video Exercise Guide & Tips', url: 'https://www.muscleandstrength.com/exercises/one-arm-dumbbell-row.html', kind: 'Video guide with tips' }
    },
    'Chest-supported dumbbell row': {
      muscles: { main: 'Mid back, lats', help: 'Rear shoulders, biceps, forearms' },
      steps: [
        'Set an incline bench to about 30-45 degrees and lie face down with your chest on the pad, feet braced on the floor.',
        'Hold a dumbbell in each hand with arms hanging straight down.',
        'Row both dumbbells toward your hips, driving your elbows back and squeezing your shoulder blades.',
        'Lower slowly to a full stretch.'
      ],
      cues: ['"Chest glued to the pad."', '"Elbows back, not up."', '"Squeeze, then stretch."'],
      fixes: [
        ['Lifting your chest off the pad', 'Lighter weight and keep your chest down.'],
        ['Shrugging', 'Pull your shoulders down and back before you row.'],
        ['Short range of motion', 'Full stretch at the bottom, squeeze at the top.']
      ],
      feel: 'Mid-back squeezing hard, with no lower-back strain because the bench holds your torso. Biceps help.',
      breath: 'Exhale on the row, inhale on the lower.',
      tempo: '1 second up, 1 second squeeze, 3 seconds down.',
      easier: 'Lighter dumbbells.',
      harder: 'Heavier, pause 2 seconds at the top.',
      ev: { lvl: 'limited', text: 'No study of this exact row. Indirect: in 7 men, a standing bent-over row put the highest load on the lower spine of the 3 rows tested, while an inverted row (torso supported by your body weight) put the least (Fenwick). It is a different exercise, but it is the logic behind a chest-supported row sparing your back.', refs: ['fenwick2009'] },
      demo: 'ro2vfHfD0DQ', more: [],
      lib: { src: 'ExRx.net', title: 'Dumbbell Lying Row', url: 'https://exrx.net/WeightExercises/BackGeneral/DBLyingRow', kind: 'Animated demo + muscle map' }
    },
    'Cable face pull': {
      muscles: { main: 'Rear shoulders (posterior deltoid), upper back', help: 'Rotator cuff (external rotators), mid traps' },
      steps: [
        'Set a pulley at about face height with a rope. Grab it with a thumbs-back grip and step back so there is tension.',
        'Stand tall with a slight lean back and elbows high.',
        'Pull the rope toward your face, splitting the ends apart as you go, until your hands are by your ears.',
        'Squeeze the back of the shoulders, then return slowly.'
      ],
      cues: ['"Pull the rope apart."', '"Elbows high, hands by your ears."', '"Squeeze your rear delts."'],
      fixes: [
        ['Leaning back and using body weight', 'Lighter weight and stand tall.'],
        ['Elbows dropping low', 'Keep your elbows at or above hand height.'],
        ['Using too much weight', 'This should be light. If your lower back is moving, go lighter.']
      ],
      feel: 'Burn in the back of the shoulders and between the shoulder blades. A light, high-rep, high-quality movement.',
      breath: 'Exhale as you pull, inhale as you return.',
      tempo: '1 second pull, 2 second squeeze, 2 seconds back.',
      easier: 'Lighter weight, or a band.',
      harder: 'Hold 2-3 seconds at the squeeze.',
      ev: { lvl: 'limited', text: 'Indirect only. In a 10-person fine-wire EMG study, lifting the arm out to the side with full outward rotation (a position like the end of a face pull) gave the highest rear-delt, middle-delt and supraspinatus activity of 7 shoulder exercises tested (Reinold). Not a face-pull study, so treat it as supporting evidence only.', refs: ['reinold2004'] },
      demo: 'eTCBSFlCJ_s', more: [],
      lib: { src: 'Muscle & Strength', title: 'Cable Face Pull: Video Exercise Guide & Tips', url: 'https://www.muscleandstrength.com/exercises/cable-face-pull', kind: 'Video guide with tips' }
    },
    'Cable biceps curl': {
      muscles: { main: 'Biceps', help: 'Brachialis, forearms' },
      steps: [
        'Set the pulley low and attach a straight or EZ bar. Stand tall with elbows at your sides.',
        'Curl the bar up toward your shoulders without moving your elbows forward.',
        'Squeeze the biceps at the top for a moment.',
        'Lower slowly until your arms are almost straight.'
      ],
      cues: ['"Elbows glued to your ribs."', '"Squeeze the biceps hard at the top."', '"Slow on the way down."'],
      fixes: [
        ['Swinging your torso', 'Lighter weight, stand tall, brace your abs.'],
        ['Elbows drift forward', 'Pin your elbows to your sides.'],
        ['Cutting the bottom half', 'Lower to near-straight arms each rep.']
      ],
      feel: 'Biceps burning, a good pump. Think about the muscle doing the work.',
      breath: 'Exhale as you curl, inhale as you lower.',
      tempo: '1 second up, 1 second squeeze, 3 seconds down.',
      easier: 'Lighter weight, or sit with your back supported.',
      harder: 'Pause at the top, slower negatives.',
      ev: { lvl: 'moderate', text: 'In 30 untrained men over 8 weeks, those who deliberately focused on squeezing the working muscle grew their elbow flexors about 12% vs 7% for those who focused on moving the weight (Schoenfeld 2018). Tested on curls and leg extensions, so it fits isolation work like this one.', refs: ['schoenfeld2018'] },
      demo: 'NFzTWp2qpiE', more: [],
      lib: { src: 'ExRx.net', title: 'Cable Curl', url: 'https://exrx.net/WeightExercises/Biceps/CBCurl', kind: 'Animated demo + muscle map' }
    },
    'Dumbbell hammer curl': {
      muscles: { main: 'Brachialis, brachioradialis (forearm), biceps', help: 'Forearm grip muscles' },
      steps: [
        'Stand tall with a dumbbell in each hand, palms facing your sides (neutral grip), elbows at your sides.',
        'Curl the dumbbells up without turning your wrists, thumbs pointing up.',
        'Squeeze at the top.',
        'Lower slowly to straight arms.'
      ],
      cues: ['"Thumbs to the ceiling."', '"Elbows pinned."', '"Slow lowering."'],
      fixes: [
        ['Swinging', 'Lighter dumbbells, stand tall.'],
        ['Elbows drifting forward', 'Pin them to your sides.'],
        ['Turning the wrists as you curl', 'Keep the neutral grip all the way.']
      ],
      feel: 'Burn in the outer upper arm and forearm. It also hits the forearm and the muscle under the biceps (brachialis).',
      breath: 'Exhale up, inhale down.',
      tempo: '1 second up, 1 second squeeze, 3 seconds down.',
      easier: 'Lighter bells, or alternate arms.',
      harder: 'Heavier, pause at the top, slower lowering.',
      ev: { lvl: 'practice', text: 'Coaching practice. No direct study cited for hammer curls growing the arm more than other curls; the mind-muscle finding on the cable curl card applies as well.', refs: ['schoenfeld2018'] },
      demo: 'zC3nLlEvin4', more: [],
      lib: { src: 'ExRx.net', title: 'Dumbbell Alternating Hammer Curl', url: 'https://exrx.net/WeightExercises/Brachioradialis/DBHammerCurl', kind: 'Animated demo + muscle map' }
    },
    /* ================= FINISHERS ================= */
    'Stair stepper': {
      muscles: { main: 'Glutes, quadriceps', help: 'Hamstrings, calves, heart and lungs' },
      steps: [
        'Step on and hold the rails lightly for balance, not to take weight off your legs.',
        'Pick a steady speed you can keep for the full time.',
        'Stand tall with your whole foot on each step and push through the heel and mid-foot.',
        'Keep an easy-to-moderate effort: you can talk in short sentences.'
      ],
      cues: ['"Tall posture, hands light."', '"Whole foot on the step."', '"Smooth and steady."'],
      fixes: [
        ['Leaning heavily on the rails', 'Lower the speed and hold the rails lightly.'],
        ['Tiny shallow steps', 'Use full steps for more glute work.'],
        ['Going too hard right after legs', 'Keep it easy, this is a finisher.']
      ],
      feel: 'Legs warm and heavy, breathing fast but controlled. You should finish feeling worked, not wrecked.',
      breath: 'Steady breathing, in through the nose, out through the mouth.',
      tempo: 'A steady pace you can sustain.',
      easier: 'Slower, or shorten the time.',
      harder: 'Gradually raise the speed in the last 2 minutes.',
      ev: { lvl: 'limited', text: 'Indirect. A meta-analysis of 21 studies found strength plus endurance training still built muscle, but running (not cycling) cut gains, and more frequent or longer cardio hurt more (Wilson). A short, easy stepper finisher keeps cardio dose low.', refs: ['wilson2012'] },
      demo: 'Z_4djaNyKEE', more: [],
      lib: null
    },
    'Rowing machine': {
      muscles: { main: 'Legs, back, arms (full body)', help: 'Heart and lungs' },
      steps: [
        'Strap in with your shins vertical at the catch, back tall, arms straight.',
        'Push first with your legs, then lean back slightly, then pull the handle to your lower ribs.',
        'Reverse the order: arms away, lean forward, then bend your knees to slide back.',
        'Keep an easy pace: the sequence is legs, body, arms, then arms, body, legs.'
      ],
      cues: ['"Legs, body, arms."', '"Arms, body, legs."', '"Smooth, not rushed."'],
      fixes: [
        ['Pulling with the arms first', 'Push with your legs first, arms last.'],
        ['Rounding the back at the catch', 'Sit tall and hinge from the hips.'],
        ['Rushing the slide back', 'Take twice as long on the recovery as on the drive.']
      ],
      feel: 'Warm legs, a light back burn, moderate breathing. Smooth and rhythmic.',
      breath: 'Exhale on the drive, inhale on the recovery.',
      tempo: '1 part drive to 2 parts recovery, about 20-24 strokes a minute.',
      easier: 'Slower pace, shorter time.',
      harder: 'Raise the stroke rate in the last 2 minutes.',
      ev: { lvl: 'limited', text: 'Indirect. Same concurrent-training evidence as the stair stepper: a short, easy aerobic finisher does not appear to blunt muscle gain, and rowing is not running (Wilson meta-analysis only separated running and cycling, so rowing is an inference).', refs: ['wilson2012'] },
      demo: '4zWu1yuJ0_g', more: [],
      lib: { src: 'Concept2', title: 'Indoor Rowing Technique on the Concept2 RowErg', url: 'https://www.concept2.com/indoor-rowers/training/technique-videos', kind: 'Official Concept2 technique videos' }
    }
  };

  /* ---- Leg day primer (reachable from the Wednesday header) ---- */
  var PRIMER = {
    title: 'Leg day primer',
    intro: 'Legs are the biggest muscles you have, so they make you work hardest. Your goal this month is not to go heavy. It is to make every rep look the same and to leave 2 reps in the tank.',
    sections: [
      { h: '1. The squat pattern in 5 steps', ev: { lvl: 'moderate', text: 'Squatting deep (thighs at least parallel) grew more thigh muscle than shallow squats in a 12-week trial of 17 men.', refs: ['bloomquist2013', 'kubo2019'] },
        items: [
          'Feet about shoulder width, toes turned out 15-30 degrees.',
          'Big belly breath and brace your abs before you go down.',
          'Sit down between your hips. Knees track over your toes, the whole foot stays on the floor.',
          'Go to at least parallel if you can keep your back flat. Pause for a beat.',
          'Push the floor away and stand tall. Your hips and chest rise together.'
        ],
        demos: ['my0tLDaWyDU', 'GQ5jj_zH2uA', '7FF6VLej_bY'] },
      { h: '2. The hip hinge in 4 steps', ev: { lvl: 'limited', text: 'Hinge drills are coaching practice. The reason to train it: hamstrings grew more when trained at long muscle lengths (the bottom of a hinge) than short ones.', refs: ['maeo2021'] },
        items: [
          'Stand a foot in front of a wall (or bench) with feet hip width and knees soft.',
          'Push your hips straight back until your butt taps the wall. Your shins stay almost vertical.',
          'Keep your back flat and your head in line with your spine. Stop when your hamstrings stretch.',
          'Squeeze your glutes to stand tall. Do not lean back at the top.'
        ],
        demos: ['2W_gXhut5S8', 'hQgFixeXdZo'] },
      { h: '3. Rack setup and safety pins', ev: { lvl: 'practice', text: 'Coaching practice (from standard barbell coaching, no study needed).', refs: [] },
        items: [
          'Set the bar at about mid-chest height so you can unrack with a small dip, not a tiptoe.',
          'Set the safety pins (or arms) just below the bottom of your squat. When you are in your lowest squat, the pins should be 1-2 inches below the bar.',
          'Test them: with an empty bar, squat down and lightly touch the bar onto the pins.',
          'Put on the collars. Load plates evenly.',
          'If you get stuck, lower the bar slowly to the pins and step out from under it. You do not need a spotter if the pins are right.',
          'Rerack only when you feel the bar touch the rack.'
        ],
        demos: ['XaOzjG1ZUbw'] },
      { h: '4. Picking a starting weight', ev: { lvl: 'moderate', text: 'The ACSM position stand on progression says to add about 2-10% load once you can do 1-2 reps more than your target.', refs: ['acsm2009', 'robinson2024'] },
        items: [
          'Back squat: do 2 sets of 8 with the empty bar (45 lb) first, then add weight each set until the last rep of a set of 8 looks like you could do 3 more. That is your working weight.',
          'Goblet squat: start with 25-35 lb for 8-12 reps. Dumbbell RDL: 20-30 lb in each hand for 10 reps.',
          'Stop each set with about 2 reps still in the tank (finishing a set feels hard but your form never changes).',
          'When all your sets hit the top of the rep range with 2 reps in reserve, add 5 lb to the bar (or the next dumbbell).',
          'If your form breaks or your back or knee hurts, drop 10-15% and build back up.'
        ],
        demos: [] },
      { h: '5. Your 3-step leg warm-up (5-8 minutes)', ev: { lvl: 'strong', text: 'A systematic review of 32 high-quality studies found warm-ups improved performance in 79% of the measures examined.', refs: ['fradkin2010'] },
        items: [
          'Step 1, raise your temperature: 3-5 minutes easy on the bike, stair stepper or rower.',
          'Step 2, open your hips and ankles: 10 bodyweight squats with a 2-second pause at the bottom, 8 slow hip hinges, 10 glute bridges.',
          'Step 3, ramp up: 1 set of 10 with the empty bar, then about 50% x 5, 70% x 3, 85% x 2 of your working weight. Rest 1 minute between ramp sets.'
        ],
        demos: ['pCEpcIo-O4I'] },
      { h: '6. What leg day should feel like', ev: { lvl: 'moderate', text: 'In an 8-week trial of 21 trained men, 3-minute rests gave more squat strength and front-thigh growth than 1-minute rests. Longer rest is not laziness.', refs: ['schoenfeld2016rest'] },
        items: [
          'Burning and heavy quads and glutes, heavy breathing, shaky legs between sets. That is the work.',
          'Rest about 2-3 minutes between heavy squat sets. Stairs may feel hard for 1-3 days.',
          'Not normal: sharp pain, a pinch in the front of the knee, pain or tingling down your leg, or low-back pain. Stop, lighten the load, and see a clinician if it does not settle.'
        ],
        demos: [] }
    ]
  };

  var SAFETY = 'General fitness information, not medical advice. Stop if you feel sharp pain, numbness, dizziness or chest pain, and see a clinician.';
  var LEVELS = {
    strong: { label: 'Strong', desc: 'Systematic review or meta-analysis on this question' },
    moderate: { label: 'Moderate', desc: 'Controlled trial or lab study on this question, small samples' },
    limited: { label: 'Limited', desc: 'Indirect or small activity (EMG) study, not a growth study' },
    practice: { label: 'Coaching practice', desc: 'Common coaching advice, no direct study found' }
  };

  PLAN.COACH = COACH; PLAN.PRIMER = PRIMER; PLAN.VIDEOS = VIDEOS; PLAN.REFS = REFS; PLAN.SAFETY = SAFETY; PLAN.LEVELS = LEVELS;
  if (typeof module !== 'undefined' && module.exports) module.exports = PLAN;
})(typeof window !== 'undefined' ? window : globalThis);
