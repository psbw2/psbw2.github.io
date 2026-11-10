/* The Pass Project v2: specific daily actions, explanatory feedback, visible completion.
   Existing Edge localStorage progress is preserved. */
(function () {
"use strict";
var originalPractice=practice;
var originalMockResult=mockResult;
var oldSchedule=schedule;
var clock=null;
var TOPIC_HINTS=[
["cardiac output","the volume of blood ejected by one ventricle per minute (heart rate × stroke volume)"],
["stroke volume","the volume of blood ejected by one ventricle per heartbeat"],
["tidal volume","the volume of air per breath"],
["minute ventilation","total air moved per minute (tidal volume × breathing frequency)"],
["breathing frequency","the number of breaths per minute"],
["lactate threshold","an exercise intensity associated with a specified blood-lactate response"],
["phosphocreatine","a rapidly available muscle phosphate donor for ATP resynthesis"],
["creatine kinase","the enzyme that transfers phosphate between phosphocreatine and ADP"],
["pyruvate dehydrogenase","the enzyme complex forming acetyl-CoA from pyruvate"],
["phosphofructokinase","a central regulatory enzyme in glycolysis"],
["lactate dehydrogenase","the enzyme interconverting pyruvate and lactate while regenerating NAD+"],
["mitochondrial","the cellular processes associated with oxidative metabolism"],
["sarcoplasmic reticulum","the organelle that stores and releases Ca²⁺ for contraction"],
["osteoblast","a bone-forming cell"],
["osteoclast","a bone-resorbing cell"],
["osteocyte","a mature bone cell with an important mechanosensory role"],
["golgi tendon organ","a proprioceptive sensor that responds to muscle–tendon tension"],
["muscle spindle","a sensory receptor responding to muscle stretch and stretch velocity"],
["motor unit","one alpha motor neuron and all muscle fibres it innervates"],
["rate coding","changes in motor-unit discharge frequency rather than recruitment number"],
["size principle","recruitment of motor units generally from low toward high threshold"],
["type iix","fast, high-force, relatively fatigable muscle fibres"],
["type iia","fast muscle fibres with mixed oxidative and glycolytic characteristics"],
["type i","slow, relatively fatigue-resistant muscle fibres"],
["sagittal","the anatomical plane dividing left and right portions"],
["frontal","the anatomical plane dividing anterior and posterior portions"],
["transverse","an anatomical plane dividing superior and inferior portions"],
["concentric","a muscle action where active fibres shorten"],
["eccentric","a muscle action where active fibres lengthen"],
["isometric","a muscle action without substantial net length change"],
["microcycle","a short planning unit, commonly about one week"],
["mesocycle","a multiweek training block made from microcycles"],
["macrocycle","a long training phase made from mesocycles"],
["reliability","the repeatability of a measurement"],
["validity","whether a measure captures its intended construct"],
["collagen","a major tensile protein of tendon, ligament and connective tissue"],
["rhomboid","a muscle involved in scapular retraction"],
["triceps","a muscle group chiefly responsible for elbow extension"]
];
var LEGACY={
"s1-1":"The countermovement or vertical jump tests rapid lower-limb force production and jump performance. This is more specific to explosive lower-body ability than a general aerobic test.",
"s1-2":"Elbow flexion in the biceps curl is primarily sagittal-plane motion about a mediolateral axis.",
"s1-3":"Westward travel involves a delay in the internal body clock. This historical key suggests two to three days; actual adjustment depends on individual circadian factors.",
"s1-4":"Proprioceptors provide sensory feedback about muscle stretch, tension and body position.",
"s1-5":"The FUNdamentals stage establishes movement skills before advanced sport-specific development.",
"s1-6":"Endurance training generally increases muscle oxidative capacity, mitochondrial volume and aerobic enzyme activity.",
"s1-7":"Slow-twitch fibres may adapt structurally to endurance training as well as improve oxidative capacity.",
"s1-8":"Early strength improvements mainly reflect better motor-unit recruitment, activation and task-specific coordination before major hypertrophy.",
"s1-9":"The stiff-leg deadlift produces a substantial hip-extensor demand, involving hamstrings across the hip.",
"s1-10":"Rest between hard 200-m efforts determines the recoverable work quality. The stated 2.5-minute answer belongs to this particular historical protocol.",
"s1-11":"Identify the performance deficit shown by the actual speed-test profile and compare the athlete with an appropriate reference.",
"s1-12":"The periosteum covers much of the external bone surface and contains osteogenic cells that contribute to formation and repair.",
"s1-13":"Linear periodisation can align with sports that peak for a comparatively predictable championship period.",
"s1-14":"Meaningful bone/connective-tissue adaptation takes weeks to months. The supplied paper uses 8–12 weeks; adaptation is not a fixed universal timetable.",
"s1-15":"Human training commonly shifts expression within fast-fibre subtypes; strong claims that type I fully converts into IIx require caution.",
"s1-16":"Golgi tendon organs respond to tension, unlike muscle spindles which respond mainly to stretch.",
"s1-17":"Humid air reduces sweat evaporation and thus evaporative cooling, even with high sweat rates.",
"s1-18":"The T-test includes multidirectional planned movement; it does not by itself measure perception and decision-making in reactive agility.",
"s1-19":"Emphasising fewer priority capacities can concentrate adaptive stimuli and reduce interference during a mesocycle.",
"s1-20":"Improving the sustainable fraction of VO₂max, often indexed through lactate/ventilatory thresholds, can improve performance after VO₂max levels off.",
"s1-21":"The strain phase of a Valsalva manoeuvre raises intrathoracic pressure, temporarily limiting venous return.",
"s1-22":"Rhomboids and middle trapezius retract the scapulae during the finishing phase of a bent-over row.",
"s1-23":"The historic paper suggests competing soon after arriving at altitude. Actual strategy depends on elevation, acclimatisation time and competition demands.",
"s1-24":"A needs analysis identifies competition demands, athlete qualities and constraints before the programme is chosen.",
"s1-25":"Test sequence should minimise fatigue interference: nonfatiguing power and speed tests generally precede fatiguing strength and endurance tests.",
"s1-26":"At an operational lactate threshold, blood lactate begins to rise by a stated criterion as production/appearance and removal become less balanced.",
"s1-27":"Higher maximal cardiac output and oxygen delivery account for much VO₂max improvement from endurance training, with peripheral adaptations also relevant.",
"s1-28":"The microcycle is the smallest commonly programmed period and sits within mesocycles.",
"s1-29":"The stretch–shortening cycle uses preactivation, elastic energy and neural contributions; shortening the amortisation phase can preserve these benefits.",
"s1-30":"Vertical jump development should emphasise appropriately loaded force production, velocity and movement-specific transfer.",
"s1-31":"A stable, neutral spine with a hip hinge facilitates a bent-over row without unwanted lumbar flexion.",
"s1-32":"Biceps femoris can externally rotate the tibia when the knee is flexed; medial hamstrings tend to rotate it internally.",
"s1-33":"Periosteal deposition adds new tissue on the outer bone surface; bone also remodels internally.",
"s1-34":"Consent to testing does not automatically mean permission for general sharing of personal results; private feedback to the athlete is appropriate.",
"s1-35":"Highly trained athletes often need more carefully individualised variation to drive adaptation and manage high training loads.",
"s1-36":"Older FTb language corresponds approximately to the human IIx phenotype; resistance training often increases IIa relative to IIx.",
"s1-37":"Heat acclimation may expand plasma volume, improve sweat response and reduce heat strain at a given workload.",
"s1-38":"An overhead press involves strong shoulder and elbow extension demands relevant to high overhead actions.",
"s1-39":"High-intensity anaerobic exercise relies heavily on carbohydrate because glycolytic ATP supply is rapid.",
"s1-40":"Ventilation increases in endurance exercise through changes in tidal volume and respiratory frequency to meet CO₂ and acid-base demands.",
"s1-41":"The wrist permits movement about two main axes: flexion-extension and radial-ulnar deviation.",
"s1-42":"Pectoralis major, triceps and anterior deltoid are major bench-press movers; teres major is not a principal horizontal press agonist.",
"s1-43":"Collagen fibres carry most tensile load in tendon, ligament and many connective tissues.",
"s1-44":"Relative strength gains can be similar for men and women after comparable training even when absolute strength differs.",
"s1-45":"Mechanical loading can change connective-tissue composition, structure and mechanical characteristics over time.",
"s1-46":"Relatively high resistance loading can provide osteogenic strain; bone adaptation is site-specific and sensitive to loading rate and novelty.",
"s1-47":"Small-sided football games integrate sport-specific movement and decision-making with aerobic conditioning.",
"s1-48":"Anaerobic glycolysis produces ATP rapidly but yields substantially less ATP per glucose than complete aerobic oxidation.",
"s1-49":"Preferential type I recruitment does not maximise force; increasing demand recruits additional higher-threshold motor units.",
"s1-50":"A shot-put action uses proximal-to-distal sequencing to transfer and develop momentum toward the implement.",
"s2-1":"The training-to-train development stage develops a broad training foundation and physical qualities before higher specialisation.",
"s2-2":"This historical answer depends on the data in the paper's athlete profile; do not generalise body-fat reduction as a priority for female footballers.",
"s2-3":"A straight-ahead kicking action primarily uses sagittal-plane hip and knee movements.",
"s2-4":"Interpret lower-body strength relative to the athlete's specific testing scores and positional demands, not from a universal reference alone.",
"s2-5":"Fitness and fatigue coexist; preparedness can improve while some fatigue remains rather than requiring fatigue to disappear completely.",
"s2-6":"Endurance adaptations can shift the workload at which blood lactate rises under a specified threshold definition.",
"s2-7":"Dumbbells permit free forearm pronation–supination, which a fixed straight bar can constrain.",
"s2-8":"With endurance training, fat oxidation capacity commonly rises at the same submaximal workload.",
"s2-9":"Calcium is stored in the sarcoplasmic reticulum and released to bind troponin, allowing contraction.",
"s2-10":"At altitude, atmospheric pressure falls, lowering inspired oxygen partial pressure even though oxygen concentration stays similar.",
"s2-11":"Racing at cooler times of day can reduce environmental heat load; humidity and solar radiation also matter.",
"s2-12":"Working muscle and skin compete for cardiac output during heavy exercise in heat, because both work and heat dissipation need perfusion.",
"s2-13":"Short hip flexors can contribute to anterior pelvic tilt, although treatment should follow an individual assessment.",
"s2-14":"Hip flexion is a sagittal-plane movement around a mediolateral or transverse axis.",
"s2-15":"Bone adaptation requires a sufficient site-specific mechanical stimulus; familiar low-strain loading may not exceed the threshold.",
"s2-16":"Type IIx fibres have relatively fast contraction and glycolytic properties and typically fatigue faster than type I.",
"s2-17":"A mesocycle often lasts several weeks, with the historical answer of four to six weeks; this is not a mandatory duration.",
"s2-18":"Strength adaptation can reflect greater neural drive and better motor coordination; decreasing CNS activation is not an explanatory mechanism.",
"s2-19":"The creatine kinase reaction transfers phosphate from phosphocreatine to ADP to rapidly resynthesise ATP.",
"s2-20":"Olympic lifts mainly train technically demanding high-velocity force expression, not maximal local muscle hypertrophy.",
"s2-21":"Medical clearance is essential when screening indicates a concern, but it is not universally necessary for every apparently healthy testing participant.",
"s2-22":"A 1RM measures maximal dynamic strength in a specific exercise under a standardised technique.",
"s2-23":"The acromioclavicular joint articulates the acromion of the scapula with the lateral clavicle.",
"s2-24":"A neuron is the structural and functional unit of the nervous system.",
"s2-25":"Endomysium surrounds each muscle fibre; perimysium surrounds fascicles and epimysium covers the entire muscle.",
"s2-26":"Within one testing session, schedule low-fatigue power/speed measures ahead of fatiguing anaerobic and aerobic work.",
"s2-27":"The size principle describes progressively recruiting motor units with higher recruitment thresholds as neural demand increases.",
"s2-28":"Rate coding means firing frequency of active motor units; the historical question's wording about the rate of recruiting new units is imprecise.",
"s2-29":"Cold-water heat loss depends on water temperature, insulation, body composition and exposure; water transfers heat much faster than air.",
"s2-30":"Larger diameter and myelination improve neural impulse conduction velocity through lower axial resistance and saltatory conduction.",
"s2-31":"Thin filaments contain actin plus associated regulatory proteins; thick filaments contain myosin.",
"s2-32":"Minimal essential strain is an idealised mechanical stimulus threshold used in models of bone adaptation.",
"s2-33":"Closed-loop control uses ongoing sensory feedback to monitor and correct a sustained movement.",
"s2-34":"Pulmonary ventilation usually is not the main limiter in healthy recreational athletes, though highly trained athletes can sometimes have pulmonary limits.",
"s2-35":"A uniaxial joint moves predominantly around one principal axis.",
"s2-36":"Shorter rest may intentionally create incomplete phosphagen recovery; the specified interval depends on whether training power or fatigue resistance.",
"s2-37":"Traditional hypertrophy guidelines often use moderate rest intervals, but longer rest can help maintain volume and force output.",
"s2-38":"Design around the individual athlete's needs, rather than adopting an unrelated teammate's programme.",
"s2-39":"UK GDPR data processing is purpose-limited; personal data cannot be used for unrestricted new purposes.",
"s2-40":"Upper-body pressing can generate substantial mechanical forces transmitted to the humerus, providing local bone loading.",
"s2-41":"Training models are structured to balance concentrated stimuli, fatigue and adaptation rather than apply every stress at once.",
"s2-42":"Bone stores calcium/phosphate and supports, protects and forms blood cells; storing vitamins is not a major primary function.",
"s2-43":"VE/VO₂ does not rise linearly throughout an incremental test; the ventilatory equivalent may decrease initially then increase around a threshold.",
"s2-44":"VO₂max is a standard laboratory index of maximal integrated oxygen uptake.",
"s2-45":"Sprint stride length depends strongly on ground reaction forces and whole-body mechanics, not a single limb measure.",
"s2-46":"Golgi tendon organs lie within the muscle–tendon connective-tissue system and respond to force/tension.",
"s2-47":"Fat oxidation provides ATP too slowly to be the sole source during very high-intensity muscular work.",
"s2-48":"Closed-loop motor control depends on sensory input and error correction in relation to the intended movement.",
"s2-49":"Lunges challenge the quadriceps and gluteal muscles unilaterally.",
"s2-50":"HISTORICAL KEY CONCERN: as exercise intensity rises, arterial oxygen content is generally maintained while mixed-venous oxygen content decreases, widening the a-vO₂ difference. The supplied key is physiologically inconsistent; verify it."
};
function reason(q){
  return LEGACY[q.id] || q.why || "The keyed option best matches the variable or mechanism described in the question.";
}
function distractorReason(q,i){
  var o=String(q.options[i]),lower=o.toLowerCase(),correct=String(q.options[q.correct]);
  for(var j=0;j<TOPIC_HINTS.length;j++){
    var term=TOPIC_HINTS[j];
    if(lower.includes(term[0]))return "This option describes "+term[1]+". It is not the specific process or property the question asks for.";
  }
  if(/^(?:all of the above|both [a-d]|none of the above)/i.test(o))
    return "This combined or exclusion choice only holds if every constituent statement meets the stem's condition. The keyed reasoning supports a different choice.";
  if(/^\s*[\d.,%–\- ]+(?:minutes?|hours?|days?|weeks?|seconds?|kg|m|cm|reps?)?\s*$/i.test(o))
    return "This numerical value does not match the keyed relationship or the scenario's particular prescription. Recheck units, conditions and context.";
  return "This is not the best choice for the situation in the stem. The decisive distinction is: "+reason(q);
}
function explanation(q,selected){
  var correct=q.correct;
  var o=q.options.map(function(option,i){
    return '<div class="expl-option '+(i===correct?'is-right':'')+'"><div class="expl-label">'+qletters[i]+' · '+(i===correct?'WHY IT IS RIGHT':'WHY IT IS NOT THE BEST CHOICE')+'</div><b>'+esc(option)+'</b><p>'+esc(i===correct?reason(q):distractorReason(q,i))+'</p></div>';
  }).join('');
  var warning=q.id==='s2-50'?'<div class="notice" style="margin-top:10px">⚠ Historical key concern: this original key appears inconsistent with basic oxygen-extraction physiology. Verify the original question/answer before memorising it.</div>':'';
  return '<div class="explain-panel"><h3>'+(selected===correct?'✓ Correct':'✕ Incorrect')+' · '+qletters[correct]+' is best</h3><p><b>Underlying explanation:</b> '+esc(reason(q))+'</p><details open><summary><b>Explain every answer choice</b></summary>'+o+'</details>'+warning+'<p class="muted small">Before moving on, explain the key rule once from memory. Wrong and uncertain responses return earlier in your adaptive review.</p></div>';
}
function partCount(date){
  var s=model.sessions[date]||{};
  return ['recall','read','quiz','reflection'].filter(function(k){return !!s[k]}).length;
}
function taskBlock(d,key,start,length,title,instructions,actions){
  var tick=!!(model.sessions[d.date]||{})[key];
  return '<div class="study-task '+(tick?'study-complete':'')+'"><div class="row"><span class="study-time">'+String(start).padStart(2,'0')+':00–'+String(start+length).padStart(2,'0')+':00</span><strong>'+title+'</strong><span class="muted small">'+length+' minutes</span></div><div class="muted" style="margin-top:13px">'+instructions+'</div><div class="actions">'+actions+'</div><label class="study-check"><input type="checkbox" '+(tick?'checked ':'')+'onchange="setDayPart(\''+d.date+'\',\''+key+'\',this.checked)"> <b>'+(tick?'✓ Completed':'Tick when completed')+'</b></label></div>';
}
schedule=function(){
  var d=dayFromDate(model.selectedDay),t=TOPICS[d.topic],count=partCount(d.date),completed=doneCount();
  var prev=PLAN[d.index-2];
  var prompts=(prev?TOPICS[prev.topic]:t).recall.slice(0,3).map(function(v){return '<li>'+esc(v)+'</li>';}).join('');
  var keypoints=t.core.slice(0,3).map(function(v){return '<li>'+esc(v)+'</li>';}).join('');
  var calendar=PLAN.map(function(x){
    var n=partCount(x.date),done=n===4;
    return '<button class="daybox '+(done?'completed ':'')+(d.date===x.date?'current':'')+'" onclick="chooseDay(\''+x.date+'\')"><div class="ddate">'+x.date.slice(5).replace('-','/')+'</div><div class="dnum">'+String(x.index).padStart(2,'0')+'</div><div class="ddate">'+x.topic+'</div><div class="check">'+(done?'✓ COMPLETED':n>0?n+'/4 DONE':'NOT STARTED')+'</div>'+(x.extraMock?'<div class="muted small">+ extra mock</div>':'')+'</button>';
  }).join('');
  var readActions='<button class="btn small" onclick="openLesson(\''+d.topic+'\')">Open guided lesson</button><a class="btn small" href="resources/Essentials of Strength Training and Conditioning 3.pdf#page='+(d.readingPage+14)+'">Open textbook PDF</a>';
  var step1=taskBlock(d,'recall',0,5,'Step 1 · Retrieve what you know','<b>Without notes</b>, answer these prompts aloud or on paper. Try each for approximately 90 seconds, then check in the lesson. Day 1 is your baseline.<ol>'+prompts+'</ol>','<button class="btn small" onclick="openLesson(\''+(prev?prev.topic:d.topic)+'\')">See recall questions</button>');
  var step2=taskBlock(d,'read',5,20,'Step 2 · Learn, understand and read','Spend <b>8 minutes</b> working through the guided in-site lesson, then <b>12 minutes</b> on <b>'+esc(d.reading)+'</b>. Explain these three ideas in your own words:<ol>'+keypoints+'</ol>',readActions);
  var step3=taskBlock(d,'quiz',25,15,'Step 3 · Complete and analyse 10 MCQs','Start a <b>10-question '+d.topic+' adaptive test</b>. Choose confidence before checking the answer, then read the explanation of the correct choice and why the other options do not fit. Aim to finish in 15 minutes.','<button class="btn small" onclick="startDrill(\''+d.topic+'\')">▶ Start today\'s MCQs</button>');
  var step4=taskBlock(d,'reflection',40,5,'Step 4 · Explain and commit to memory','Open your topic notes and write: <b>(1)</b> two mechanisms you now understand, <b>(2)</b> your most important error, and <b>(3)</b> a one-sentence memory rule. Close your notes and recall the rule once.','<button class="btn small" onclick="openLesson(\''+d.topic+'\')">Open and save memory notes</button>');
  var extra=d.extraMock?'<div class="panel" style="border-color:#738d68"><div class="kicker">EXTRA SESSION · 60 MINUTES</div><h3>'+esc(DATA.mocks[d.extraMock].name)+'</h3><p class="muted small">This is separate from the 45-minute session. You may take it on another day.</p><button class="btn primary" onclick="launchMock(\''+d.extraMock+'\')">Start extra mock</button></div>':'';
  var timeline=PLAN.map(function(x){return '<div class="timeline-card '+(hasCompleted(x.date)?'timeline-complete':'')+'"><div class="day-date">'+String(x.index).padStart(2,'0')+'</div><div><h3>'+esc(x.title)+'</h3><p>'+x.topic+' · 45 min · <b>'+(hasCompleted(x.date)?'✓ Completed':partCount(x.date)+'/4 steps complete')+'</b>'+(x.extraMock?' · +60 min mock':'')+'</p></div><button class="btn small" onclick="chooseDay(\''+x.date+'\')">Open</button></div>';}).join('');
  return '<div class="kicker">A specific plan for every day</div><h1 class="page-title">Your 22-day schedule</h1><p class="lead">Follow each timed step in order. Tick the box when you finish it. All four ticks make the entire day show <b>✓ COMPLETED</b> in the calendar and on your dashboard. Each day is approximately 45 minutes; mocks are optional additional 60-minute sessions.</p>'+
  '<div class="panel"><div class="row"><h3>Revision calendar</h3><span class="badge '+(completed===22?'good':'')+'">'+completed+'/22 days completed</span></div><div class="track" style="margin:12px 0 20px"><i style="width:'+(100*completed/22)+'%"></i></div><div class="day-grid">'+calendar+'</div></div>'+
  '<div class="section-title" id="dayDetails"><h2>Day '+d.index+' · '+esc(d.title)+'</h2><span class="pill secondary">'+(hasCompleted(d.date)?'✓ COMPLETED':count+'/4 steps · 45 min')+'</span></div><div class="twocol"><div class="panel"><div class="flexgap"><span class="tag">'+d.topic+'</span><span class="badge">'+d.date+'</span></div><p class="muted">'+esc(d.detail)+'</p><div class="track" style="margin:13px 0"><i style="width:'+(count*25)+'%"></i></div>'+step1+step2+step3+step4+
  '<div class="notice" style="margin-top:15px">'+(hasCompleted(d.date)?'<b>✓ DAY COMPLETE!</b> All four steps are saved. The calendar and dashboard show this day as COMPLETED.':'<b>'+count+'/4 steps saved in Edge.</b> Tick each remaining task when genuinely finished; the calendar updates instantly.')+'</div><div class="actions"><button class="btn primary" onclick="go(\'dashboard\')">View dashboard</button><button class="btn" onclick="chooseDay(\''+PLAN[Math.min(PLAN.length-1,d.index)].date+'\')">Next day →</button></div></div>'+
  '<div class="stack"><div class="panel"><h3>Reading for today</h3><p>'+esc(d.reading)+'</p><div class="actions"><a href="resources/Essentials of Strength Training and Conditioning 3.pdf#page='+(d.readingPage+14)+'" class="btn primary">Open chapter page ↗</a><a href="resources/UKSCA Competency Document.pdf" class="btn">Competency PDF</a></div><p class="muted small">These PDFs can be kept privately in Edge, using the Documents tab. You can still complete the guided lesson without a textbook PDF.</p></div>'+extra+'<div class="panel"><h3>Today's outcome</h3><p class="muted">By the end you should be able to explain and apply '+esc(t.title).toLowerCase()+' without depending on answer recognition.</p><button class="btn small" onclick="go(\'practice\')">See my weak areas</button></div></div></div>'+
  '<div class="section-title"><h2>Every study day at a glance</h2></div><div class="timeline">'+timeline+'</div>';
};
practice=function(){
  var page=originalPractice();
  var d=model.activeDrill;
  if(!d||d.index>=d.ids.length||!d.feedback)return page;
  var q=QBY[d.ids[d.index]];
  var start=page.indexOf('<div class="feedback ');
  var end=page.indexOf('<div class="actions">',start);
  if(start<0||end<0)return page;
  return page.slice(0,start)+explanation(q,d.selected)+page.slice(end);
};
mockResult=function(run){
  var paper=DATA.mocks[run.paper],attempts=model.attempts.filter(function(a){return a.run===run.id;});
  var reviews=run.wrong.map(function(id){
    var q=QBY[id],attempt=attempts.find(function(a){return a.qid===id;});
    var selected=attempt?attempt.chosen:-1;
    return '<details class="error-review"><summary><b>'+q.topic+'</b> · '+esc(q.stem)+'</summary>'+(selected>=0?'<p class="small">Your answer: '+qletters[selected]+' — '+esc(q.options[selected])+'</p>':'<p class="small">Unanswered question.</p>')+explanation(q,selected)+'</details>';
  }).join('');
  return '<div class="panel" style="margin:18px 0"><div class="row"><h3>'+esc(paper.name)+' · '+run.score+'/50</h3><span class="badge '+(run.score>=43?'good':run.score>=33?'moderate':'danger')+'">'+fmtPct(run.score/50)+'</span></div><p class="muted">Open each missed question for the explanation, correct choice and analysis of the alternatives. Your mistakes feed future adaptive practice.</p>'+ (reviews||'<div class="notice">All questions correct. Retest later to confirm long-term retention.</div>')+'</div>';
};
var style=document.createElement('style');
style.textContent='.study-task{padding:17px;margin:15px 0;border:1px solid var(--line);border-radius:13px;background:#10242f}.study-task.study-complete{background:#17352f;border-color:#72a47a}.study-time{font-size:12px;font-weight:900;color:var(--accent);background:#233c48;border-radius:9px;padding:6px 9px;white-space:nowrap}.study-task ol{padding-left:23px;margin:10px 0 6px}.study-task li{margin:5px 0}.study-task .row{gap:10px;flex-wrap:wrap}.study-check{display:inline-flex;gap:9px;align-items:center;background:#223e47;border-radius:9px;padding:10px 12px;margin-top:10px;cursor:pointer;border:1px solid #567e85}.study-check:has(input:checked){background:#284e38;color:#c6f37a}.study-check input{width:18px;height:18px;accent-color:var(--accent)}.daybox.completed{background:#20483b!important;border:2px solid #9fe280!important}.daybox.completed .check{color:#d8ffac;font-weight:900}.timeline-complete{border-left:4px solid #a4e776!important}.explain-panel{padding:15px;margin:15px 0;border:1px solid #6b9675;background:#173a30;border-radius:12px}.explain-panel h3{color:#d3ffae}.explain-panel details{margin:13px 0}.explain-panel summary{cursor:pointer}.expl-option{padding:10px;margin:9px 0;border-radius:9px;background:#102732;border:1px solid #3e5c65}.expl-option.is-right{border-color:#9ed680;background:#1d4432}.expl-option p{font-size:13px;margin:5px 0;line-height:1.55;color:#c4d5db}.expl-label{font-size:10px;letter-spacing:.06em;color:#a9d9e1;font-weight:900;margin-bottom:4px}.error-review{padding:10px 0;border-top:1px solid var(--line)}.error-review summary{cursor:pointer}';
document.head.appendChild(style);
render();
})();
