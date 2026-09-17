// "How to live this": where each passage comes from, what it asks of you, and a
// question to sit with.
//
// These are written for the passage rather than for a particular person. They
// are what shows before Claude's reading arrives and what stays when there is
// no connection. Claude's reading replaces all three with lines written for the
// situation someone actually described.
//
// Settings describe what each text presents about itself. Where authorship is
// traditional rather than certain they say so, and Hebrews is left anonymous.

export type Living = { setting: string; apply: string; reflect: string };

export const LIVING: Record<string, Living> = {
  "Philippians 4:6-7": {
    setting: "Paul, writing from prison, to the church at Philippi, a community he loved and who had stood by him.",
    apply: "Name the specific worry to God in plain words, as a request, and add one true thing you are thankful for alongside it.",
    reflect: "What would you ask for if you believed you would be heard?",
  },
  "1 Peter 5:7": {
    setting: "A letter bearing Peter's name, to scattered Christians in Asia Minor who were facing hostility for their faith.",
    apply: "Pick the one care weighing most right now and deliberately hand it over, then do the next ordinary task without picking it back up.",
    reflect: "Which care are you holding because you believe no one else will?",
  },
  "Matthew 6:34": {
    setting: "Jesus, in the Sermon on the Mount, to crowds of ordinary people in Galilee living close to the edge.",
    apply: "Draw a line around today. Write tomorrow's worries down so they are not lost, then leave them until tomorrow comes.",
    reflect: "What does today actually need from you, if you leave tomorrow alone?",
  },
  "Matthew 6:26": {
    setting: "Jesus, in the Sermon on the Mount, pointing his listeners to the birds overhead as they sat on a Galilean hillside.",
    apply: "Step outside or to a window and actually watch something alive for a minute. Let the evidence argue with the fear.",
    reflect: "What have you been provided with before, that you had stopped counting?",
  },
  "Isaiah 26:3": {
    setting: "From a song Isaiah gives to Judah, looking ahead to a day when God's people would live securely.",
    apply: "When your mind runs off, bring it back to one short line about God, as often as it takes, without scolding yourself for wandering.",
    reflect: "Where does your attention go when it is left alone?",
  },
  "Psalm 94:19": {
    setting: "An unnamed psalmist, crying out against injustice and the arrogance of people who harm the vulnerable.",
    apply: "Stop trying to win the argument in your head. Say, even quietly, one comfort you have actually known from God.",
    reflect: "Which of your thoughts are loud because they are true, and which only because they are loud?",
  },
  "John 14:27": {
    setting: "Jesus to his disciples at the Last Supper, hours before his arrest, preparing them to lose him.",
    apply: "Notice the difference between peace that depends on things settling and peace that holds while they do not. Ask for the second.",
    reflect: "What kind of peace have you been waiting for?",
  },
  "Psalm 55:22": {
    setting: "A psalm attributed to David, written in the pain of being betrayed by a close companion.",
    apply: "Say out loud what the burden is, in a sentence. Something named is easier to hand over than something only felt.",
    reflect: "What would it mean to be held up rather than to have it taken away?",
  },
  "Isaiah 41:10": {
    setting: "God speaking to Israel in exile in Babylon, a people defeated, scattered and afraid they had been abandoned.",
    apply: "Read the four promises slowly and pick the one you need most today. Carry that one sentence with you.",
    reflect: "Which of the four do you find hardest to believe right now?",
  },
  "Psalm 27:1": {
    setting: "A psalm attributed to David, a man who lived for years with real enemies and real danger.",
    apply: "Write down what you are afraid of, then write this verse beside it. Let the two sit on the same page.",
    reflect: "If your fear shrank to its actual size, what would it look like?",
  },
  "Psalm 56:3": {
    setting: "Attributed to David, from when the Philistines seized him in Gath, alone and in danger.",
    apply: "You do not have to stop being afraid first. The next time fear rises, say this line and keep going.",
    reflect: "What would trusting look like while you are still afraid?",
  },
  "2 Timothy 1:7": {
    setting: "A letter from Paul, in prison near the end of his life, to Timothy, his young and sometimes timid protégé.",
    apply: "Choose one small thing fear has been talking you out of, and do it today with a clear head rather than a racing one.",
    reflect: "What has fear been telling you about who you are?",
  },
  "Joshua 1:9": {
    setting: "God to Joshua, newly in charge after Moses died, about to lead a whole people across the Jordan.",
    apply: "Take the first step of the thing you feel too small for. Courage here is an action, not a feeling you wait for.",
    reflect: "Where are you going that you would rather not go alone?",
  },
  "Psalm 23:4": {
    setting: "A psalm attributed to David, who knew the work of a shepherd guiding sheep through dangerous ground.",
    apply: "Do not demand a way around the valley. Look instead for the signs that you are not walking it alone.",
    reflect: "Who or what has been walking beside you that you have not noticed?",
  },
  "Psalm 34:18": {
    setting: "Attributed to David, written after he escaped danger by pretending to be mad before a foreign king.",
    apply: "You do not have to pull yourself together before you pray. Come exactly as broken as you are.",
    reflect: "What would you say to God if you did not have to sound all right?",
  },
  "John 11:35": {
    setting: "At the tomb of Lazarus in Bethany, with his sisters Mary and Martha grieving, just before Jesus raised him.",
    apply: "Let yourself cry, or let someone see you grieve. Tears are not a lack of faith; Jesus wept too.",
    reflect: "Where have you been holding back grief because you thought you should be past it?",
  },
  "Matthew 5:4": {
    setting: "Jesus, opening the Sermon on the Mount with blessings on the people who least looked blessed.",
    apply: "Stop treating your grief as something in the way. Let it be the place where comfort can find you.",
    reflect: "What kind of comfort would actually help, and who could you ask for it?",
  },
  "Psalm 147:3": {
    setting: "A hymn celebrating God rebuilding Jerusalem and gathering the exiles home after the Babylonian captivity.",
    apply: "Healing is slow and done by hand. Be as patient with your own heart as a nurse changing a dressing.",
    reflect: "Which wound are you expecting to heal faster than wounds heal?",
  },
  "Psalm 30:5": {
    setting: "Attributed to David, a song of thanks after being brought back from a time he thought would destroy him.",
    apply: "Tonight may be long. Tell yourself, and mean it, that it is still night and not the rest of your life.",
    reflect: "What morning have you already come through that you could remember tonight?",
  },
  "2 Corinthians 1:3-4": {
    setting: "Paul to the church at Corinth, after a crisis in Asia so severe he says he despaired even of life.",
    apply: "Receive the comfort that is offered to you now. One day, when you are ready, it will be yours to pass on.",
    reflect: "Who comforted you once in a way you have never forgotten?",
  },
  "Revelation 21:4": {
    setting: "John's vision on the island of Patmos, written to small churches under pressure from the Roman empire.",
    apply: "Let this be the horizon, not a way of skipping today. Grieve now, knowing grief does not get the last word.",
    reflect: "What tears would you most want wiped away?",
  },
  "Ecclesiastes 3:4": {
    setting: "From the Teacher of Ecclesiastes, reflecting honestly on how life moves in seasons no one fully controls.",
    apply: "Give yourself permission to be in the season you are actually in, whatever anyone else expects.",
    reflect: "What season are you in, if you are honest?",
  },
  "Psalm 42:11": {
    setting: "By the sons of Korah, from a psalmist far from the temple and taunted by people asking where their God is.",
    apply: "Talk to yourself the way this psalmist does. Ask why you are downcast, then answer with hope, even hesitantly.",
    reflect: "If you asked your own soul why it is low, what would it say?",
  },
  "Lamentations 3:22-23": {
    setting: "Written in the ruins of Jerusalem after the Babylonians burned it in 587 BC; traditionally attributed to Jeremiah.",
    apply: "Tomorrow morning, before anything else, look for one mercy that is new that day, however small.",
    reflect: "What mercy has already kept you from being consumed?",
  },
  "Psalm 40:1-2": {
    setting: "A psalm attributed to David, looking back on being rescued after a long and patient wait.",
    apply: "Keep crying out, even if the answer has not come yet. Waiting patiently is not the same as waiting silently.",
    reflect: "What would solid ground look like for you now?",
  },
  "1 Kings 19:5-7": {
    setting: "Elijah, exhausted and asking God to let him die, fleeing Queen Jezebel right after his victory on Mount Carmel.",
    apply: "Before you try to sort out how you feel, eat something and sleep. Your body's needs are not a spiritual failure.",
    reflect: "When did you last eat properly and rest?",
  },
  "Psalm 88:18": {
    setting: "By Heman the Ezrahite, the bleakest of the psalms, which ends in darkness with no turn toward hope.",
    apply: "You are allowed to pray without a happy ending. Bring your darkness to God as it is; this psalm did.",
    reflect: "What would you say to God if you did not have to end on a hopeful note?",
  },
  "Isaiah 61:3": {
    setting: "To exiles back in a ruined Jerusalem; centuries later Jesus read this passage aloud in the synagogue at Nazareth.",
    apply: "Hand over the ashes rather than pretending they are not there. The exchange begins with admitting what you carry.",
    reflect: "What ashes are you holding that you have not yet let go of?",
  },
  "Hebrews 13:5": {
    setting: "An anonymous letter to Jewish Christians under pressure, quoting the promise first given to Joshua.",
    apply: "Let the promise of presence answer the fear of not having enough. Name one thing you have that is enough for today.",
    reflect: "What would contentment look like if you were not afraid of being left?",
  },
  "Psalm 139:7-10": {
    setting: "A psalm attributed to David, marveling that there is nowhere he could go that God would not already be.",
    apply: "Wherever you feel too far gone, say plainly: even here. Then treat that as true.",
    reflect: "Where have you assumed God could not follow you?",
  },
  "Psalm 68:6": {
    setting: "Attributed to David, a processional song celebrating God as the defender of orphans and widows.",
    apply: "Take one small step toward people: a message, an invitation accepted, a seat at someone's table.",
    reflect: "Where might a family be waiting that does not look like the one you expected?",
  },
  "Psalm 25:16": {
    setting: "A psalm attributed to David, written as an alphabet acrostic prayer from a lonely and troubled heart.",
    apply: "Pray this line as it is, as many times as you need. Short prayers are still prayers.",
    reflect: "What would it feel like to be turned toward, rather than overlooked?",
  },
  "Matthew 28:20": {
    setting: "The last words of Matthew's gospel, spoken by the risen Jesus on a mountain in Galilee.",
    apply: "Go into today with this sentence rather than waiting to feel less alone. Presence is promised, not earned.",
    reflect: "What would you do differently today if you knew you were not alone in it?",
  },
  "Ephesians 4:26": {
    setting: "A letter from Paul to the church at Ephesus, teaching a mixed community how to live together honestly.",
    apply: "Do not bury the anger or act on it tonight. Before you sleep, decide one honest step toward resolving it.",
    reflect: "What is your anger trying to protect?",
  },
  "James 1:19-20": {
    setting: "Traditionally James, the brother of Jesus and leader of the Jerusalem church, writing to scattered believers.",
    apply: "In the next hard conversation, ask one more question than you normally would before you give your view.",
    reflect: "What would you hear if you listened a little longer?",
  },
  "Proverbs 15:1": {
    setting: "From the collected proverbs of Solomon, practical wisdom for ordinary life in ancient Israel.",
    apply: "Make your next reply to someone who is angry with you softer than the one you would reach for.",
    reflect: "Which of your recent answers turned the heat up instead of down?",
  },
  "Romans 12:19": {
    setting: "Paul to the church in Rome, a divided community of Jewish and Gentile believers he had not yet visited.",
    apply: "Write down what was done to you, then consciously hand the verdict to God instead of carrying out the sentence yourself.",
    reflect: "What would it free you from to stop being the one who settles this?",
  },
  "Psalm 4:4": {
    setting: "A psalm attributed to David, an evening prayer from someone surrounded by people speaking against him.",
    apply: "Take the anger to bed without taking it out on anyone. Lie still, and let it be looked at rather than acted on.",
    reflect: "What do you notice when you are quiet with your anger instead of loud with it?",
  },
  "1 John 1:9": {
    setting: "A letter traditionally attributed to the apostle John, to churches unsettled by division and false teaching.",
    apply: "Name the specific thing plainly to God, without excuses or a speech. Then treat yourself as forgiven, because he is faithful.",
    reflect: "What have you been confessing over and over as if it had not been heard?",
  },
  "Psalm 103:12": {
    setting: "A psalm attributed to David, praising God for a forgiveness that outlasts every failure.",
    apply: "When the old guilt comes back, picture the distance in this verse and refuse to walk back across it.",
    reflect: "What wrong do you keep going back to fetch?",
  },
  "Romans 8:1": {
    setting: "Paul to the church in Rome, just after describing his own struggle to do the good he wants.",
    apply: "Notice the voice that keeps condemning you, and answer it with this verse rather than arguing your case.",
    reflect: "Who taught you to keep sentencing yourself?",
  },
  "Isaiah 1:18": {
    setting: "Isaiah to Judah in the eighth century BC, confronting a people whose worship had gone empty and cruel.",
    apply: "Come and talk it through honestly rather than hiding. Bring the stain as it is; the invitation came first.",
    reflect: "What would you say if God really did want to reason it through with you?",
  },
  "Psalm 51:10": {
    setting: "Attributed to David after the prophet Nathan confronted him over Bathsheba and the killing of her husband Uriah.",
    apply: "Ask to be changed from the inside, not just forgiven. Then take one concrete step away from the thing that stained you.",
    reflect: "What would a clean heart do differently tomorrow?",
  },
  "Joel 2:25": {
    setting: "The prophet Joel, writing after a locust plague stripped the land bare and ruined years of harvest.",
    apply: "Grieve the lost years honestly, and then look for one thing in the present that could still grow.",
    reflect: "What do you believe those lost years have cost you for good?",
  },
  "Micah 7:19": {
    setting: "The prophet Micah, in the eighth century BC, closing a book of hard warnings with a song of mercy.",
    apply: "Picture the thing sinking out of reach into deep water. When you are tempted to dive for it, let it stay there.",
    reflect: "What are you keeping on file that God has thrown into the sea?",
  },
  "Colossians 3:13": {
    setting: "Paul to the church at Colossae, describing how people who have been forgiven live together.",
    apply: "Remember the forgiveness you have received, then take one step toward extending it to the person you have a quarrel with.",
    reflect: "What were you forgiven that you did not deserve to be?",
  },
  "Matthew 18:21-22": {
    setting: "Jesus answering Peter, who thought forgiving seven times was already generous, before telling a parable about debt.",
    apply: "Stop counting. Forgive again the thing you have already forgiven, even if the feeling has to catch up later.",
    reflect: "Where are you keeping score?",
  },
  "Ephesians 4:32": {
    setting: "A letter from Paul to the church at Ephesus, on how people shaped by grace speak to and treat each other.",
    apply: "Do one kind thing for someone you are struggling to forgive, without waiting to feel tender first.",
    reflect: "Where have you gone numb in order to cope?",
  },
  "Luke 23:34": {
    setting: "Jesus on the cross at Golgotha, praying for the soldiers who had just nailed him there.",
    apply: "Pray for the person who hurt you, even if the prayer is only their name and the word forgive.",
    reflect: "What would it take to pray for them while it still hurts?",
  },
  "1 Corinthians 10:13": {
    setting: "Paul to the church at Corinth, a port city famous for its temptations, warning against overconfidence.",
    apply: "Before the moment comes, decide where your way out is: a person to call, a place to go, a thing to do instead.",
    reflect: "What is the exit you usually walk past?",
  },
  "Romans 7:15": {
    setting: "Paul to the church in Rome, describing the war inside a person who wants to do right and keeps failing.",
    apply: "Stop pretending you have it together. Tell one trusted person about the pattern you keep repeating.",
    reflect: "What would change if you stopped being surprised by your own weakness?",
  },
  "Hebrews 4:15-16": {
    setting: "An anonymous letter to Jewish Christians tempted to give up their faith under pressure.",
    apply: "Go to God boldly with the thing you are ashamed of, today, rather than waiting until you have cleaned yourself up.",
    reflect: "What would you ask for if you expected mercy rather than disappointment?",
  },
  "James 4:7": {
    setting: "Traditionally James, the brother of Jesus, to believers torn by quarrels and competing desires.",
    apply: "When the pull comes, say no out loud and physically move: stand up, leave the room, change what is in front of you.",
    reflect: "What does resisting actually look like in your situation, in practical terms?",
  },
  "Proverbs 24:16": {
    setting: "From the sayings of the wise in Proverbs, on how the righteous live through trouble.",
    apply: "Get up today. Not perfectly, not permanently; just get up from this fall.",
    reflect: "Which fall are you treating as if it were the last word?",
  },
  "Galatians 5:1": {
    setting: "Paul to the churches in Galatia, who were being pressured back into rules they had been freed from.",
    apply: "Name the thing that has you entangled again and take one practical step to put distance between you and it.",
    reflect: "What does freedom look like for you this week?",
  },
  "Mark 9:24": {
    setting: "A desperate father whose son had seizures, speaking to Jesus after the disciples had failed to heal the boy.",
    apply: "Pray exactly this prayer. You do not need to resolve your doubt before you ask for help.",
    reflect: "What part of you believes, and what part does not, right now?",
  },
  "Proverbs 3:5-6": {
    setting: "A father's teaching to his son in the opening chapters of Proverbs, on where to rest your weight.",
    apply: "Before your next decision, admit what you do not understand, and ask for direction before you lean on your own reading.",
    reflect: "Where are you leaning on your own understanding because you are afraid to lean anywhere else?",
  },
  "Isaiah 55:8-9": {
    setting: "God's invitation to exiles in Babylon to come home, offered freely, like water to the thirsty.",
    apply: "Let it be all right not to understand. Hold on without needing the explanation first.",
    reflect: "Which question do you most need answered before you will trust?",
  },
  "Habakkuk 1:2": {
    setting: "The prophet Habakkuk, late in the seventh century BC, arguing with God as violence spread and Babylon rose.",
    apply: "Say your complaint to God honestly, in your own words. Protest is still a way of staying in the conversation.",
    reflect: "What have you been afraid to say to God out loud?",
  },
  "Hebrews 11:1": {
    setting: "An anonymous letter, opening a long list of people who kept faith without seeing the promise fulfilled.",
    apply: "Act on one thing you hope for as if it is real: make the call, keep the practice, take the step.",
    reflect: "What are you hoping for that you cannot yet see?",
  },
  "Isaiah 40:31": {
    setting: "Comfort spoken to exiles in Babylon who had concluded that God had forgotten them.",
    apply: "On the days you cannot soar or run, walking without fainting is still the promise. Walk today.",
    reflect: "What pace is actually possible for you right now?",
  },
  "Psalm 27:14": {
    setting: "A psalm attributed to David, ending a prayer written in the middle of danger and false accusation.",
    apply: "Choose to wait with courage today. Tell yourself twice, as the psalm does, if once is not enough.",
    reflect: "What does courageous waiting look like, as opposed to anxious waiting?",
  },
  "Habakkuk 2:3": {
    setting: "God's answer to the prophet Habakkuk, who had demanded to know why injustice was being allowed.",
    apply: "Write down what you are waiting for, so you can hold it and keep watching instead of giving up.",
    reflect: "How do you tell the difference between a delay and a no?",
  },
  "Ecclesiastes 3:1": {
    setting: "From the Teacher of Ecclesiastes, reflecting on how every part of life comes in its own time.",
    apply: "Name the season you are in, and stop comparing it with someone else's.",
    reflect: "What is this season for, even if it is not the one you wanted?",
  },
  "Galatians 6:9": {
    setting: "Paul closing his letter to the Galatian churches, urging them not to quit doing good.",
    apply: "Keep doing the good thing you are tired of doing for one more day, and rest where you can without quitting.",
    reflect: "What good work have you been close to giving up on?",
  },
  "Psalm 130:5-6": {
    setting: "A song of ascents, sung by pilgrims on the road up to Jerusalem, from someone in deep trouble.",
    apply: "Wait like a night watchman, awake and certain the morning is coming, rather than asleep or in despair.",
    reflect: "What makes you sure the morning will come?",
  },
  "Philippians 4:19": {
    setting: "Paul, in prison, thanking the Philippians for a gift they sent him out of their own poverty.",
    apply: "List what you actually need this week, separate from what you want, and bring that list to God.",
    reflect: "Which of your needs are you most afraid will not be met?",
  },
  "Matthew 6:31-33": {
    setting: "Jesus in the Sermon on the Mount, speaking to poor Galilean farmers and fishermen about food and clothing.",
    apply: "Before you work out the money question, ask what seeking God first would look like in this decision.",
    reflect: "What would change if the kingdom came first in this worry?",
  },
  "Psalm 37:25": {
    setting: "A psalm attributed to David, written as the wisdom of an old man looking back on a long life.",
    apply: "Talk to someone older who has been through lean times, and ask them what they saw.",
    reflect: "What evidence of provision have you already seen in your own life?",
  },
  "1 Timothy 6:6-8": {
    setting: "A letter from Paul to Timothy in Ephesus, warning about people who treated faith as a way to get rich.",
    apply: "Name one thing you already have that is enough, and say thank you for it before you ask for more.",
    reflect: "What would enough look like for you?",
  },
  "Luke 12:15": {
    setting: "Jesus, after a man in the crowd asked him to make his brother share the family inheritance.",
    apply: "Look at what you are chasing and ask honestly whether it is your life or only something you would own.",
    reflect: "What does your life consist of, if not your possessions?",
  },
  "Colossians 3:23": {
    setting: "Paul to the church at Colossae, addressed to enslaved people doing work they had not chosen.",
    apply: "Do the next task, even a dull one, as an offering rather than a performance for whoever is watching.",
    reflect: "Who are you really working for?",
  },
  "Jeremiah 29:11": {
    setting: "Jeremiah's letter to the exiles in Babylon, telling them to build houses and settle in for seventy years.",
    apply: "Plant something where you are, even if it is not where you want to be. Hope here is patient, not instant.",
    reflect: "What would it look like to build a life in the waiting?",
  },
  "Ephesians 2:10": {
    setting: "A letter from Paul to the church at Ephesus, right after saying that salvation is a gift and not earned.",
    apply: "Look for one good work already in front of you today, and step into it without needing it to be grand.",
    reflect: "What good work might have been prepared with you in mind?",
  },
  "Romans 8:28": {
    setting: "Paul to the church in Rome, in a chapter about suffering, groaning and hope.",
    apply: "Do not force every hard thing to be good. Trust instead that it is being worked into something good.",
    reflect: "Where have you seen something painful woven into something good before?",
  },
  "Proverbs 16:3": {
    setting: "From the proverbs of Solomon, practical wisdom about planning and God's part in it.",
    apply: "Before you start the work, hand it over explicitly, then give yourself to the work rather than to the worry.",
    reflect: "What plan are you holding too tightly to commit it?",
  },
  "Ecclesiastes 9:10": {
    setting: "From the Teacher of Ecclesiastes, writing with death in view about making the most of life.",
    apply: "Put your whole self into one task today rather than half of yourself into many.",
    reflect: "What is your hand finding to do right now?",
  },
  "Psalm 119:105": {
    setting: "From the longest psalm, an anonymous alphabet acrostic in praise of God's word.",
    apply: "Ask only for enough light for the next step, and take that step rather than waiting to see the whole road.",
    reflect: "What is the next step, just the next one?",
  },
  "James 1:5": {
    setting: "Traditionally James, the brother of Jesus, writing to believers facing trials and hard decisions.",
    apply: "Ask for wisdom about this specific decision, plainly, without apologising for not knowing.",
    reflect: "What would you ask if you were sure you would not be judged for asking?",
  },
  "Isaiah 30:21": {
    setting: "Isaiah to Judah, who were trusting an alliance with Egypt instead of turning back to God.",
    apply: "Start moving in the direction that seems right, and keep listening for correction as you go.",
    reflect: "What quiet guidance have you been ignoring?",
  },
  "Proverbs 16:9": {
    setting: "From the proverbs of Solomon, on the gap between our plans and what actually happens.",
    apply: "Make your plan, then hold it loosely enough that a redirected step does not feel like failure.",
    reflect: "What plan that did not work out led somewhere you needed to be?",
  },
  "Psalm 32:8": {
    setting: "A psalm attributed to David, written after the relief of finally confessing what he had hidden.",
    apply: "Stay close enough to be guided by a look rather than a bridle. Check in daily, not only when you are stuck.",
    reflect: "What would being guided day to day look like, rather than only in a crisis?",
  },
  "Proverbs 11:14": {
    setting: "From the proverbs of Solomon, on how decisions go better with many advisers.",
    apply: "Before you decide, ask two or three people you trust what they see that you might be missing.",
    reflect: "Whose counsel have you been avoiding?",
  },
  "2 Corinthians 12:9": {
    setting: "Paul to Corinth, describing a thorn in the flesh he had begged God three times to remove.",
    apply: "Stop hiding the weakness as if it disqualifies you. Let it be the place you rely on grace today.",
    reflect: "What weakness have you prayed would disappear that might instead be where strength shows up?",
  },
  "Psalm 73:26": {
    setting: "Asaph, a temple musician, after nearly losing his faith watching the wicked prosper.",
    apply: "Admit honestly what is failing, whether body, will or strength, and then name what remains.",
    reflect: "When everything else gives out, what is still yours?",
  },
  "Romans 8:18": {
    setting: "Paul to the church in Rome, writing as someone who had been beaten, imprisoned and shipwrecked.",
    apply: "Do not minimise your suffering. Set it on a longer scale, and let the future carry weight too.",
    reflect: "What would change if this suffering were not the whole story?",
  },
  "2 Corinthians 4:16-17": {
    setting: "Paul to Corinth, writing about a body worn down by years of hardship in his work.",
    apply: "Look for one small way you are being renewed today, even as your strength wears thin.",
    reflect: "What is being renewed in you that no illness can reach?",
  },
  "Psalm 41:3": {
    setting: "A psalm attributed to David, written from a sickbed while enemies waited for him to die.",
    apply: "Let yourself be cared for. Accept one kindness today without apologising for needing it.",
    reflect: "Who has been caring for you that you have not thanked?",
  },
  "Micah 6:8": {
    setting: "Micah to Judah in the eighth century BC, answering people who thought more sacrifices would please God.",
    apply: "Pick one of the three for today: do one just thing, show one act of mercy, or take one step of humility.",
    reflect: "Which of the three is hardest for you right now?",
  },
  "Amos 5:24": {
    setting: "Amos, a shepherd from Tekoa, to wealthy Israel holding religious festivals while crushing the poor.",
    apply: "Turn the anger at injustice into one concrete act: give, speak up, show up, or vote with it in mind.",
    reflect: "Where could your anger become a stream rather than a storm?",
  },
  "Psalm 9:9": {
    setting: "A psalm attributed to David, praising God as the one who does not forget the afflicted.",
    apply: "Go to the refuge before you try to fix everything. Take a few minutes to be sheltered before you act.",
    reflect: "What would it mean to take refuge rather than keep fighting alone?",
  },
  "Proverbs 31:8-9": {
    setting: "The words of King Lemuel, which the text says his mother taught him about using power rightly.",
    apply: "Use your voice this week for someone who cannot use theirs: a call, a letter, a word in the right room.",
    reflect: "Whose cause could you plead that no one else is pleading?",
  },
  "Psalm 37:1-2": {
    setting: "A psalm attributed to David, an alphabet acrostic of wisdom about not envying people who do wrong.",
    apply: "Stop checking how well they are doing. Turn your attention to the good in front of you.",
    reflect: "How much of your peace are you handing to people who have done wrong?",
  },
  "Psalm 55:12-14": {
    setting: "A psalm attributed to David, written after being betrayed by a close friend he once worshipped beside.",
    apply: "Name the betrayal honestly, including who it was. Pretending it hurt less than it did will not help you heal.",
    reflect: "What did you lose along with that friendship?",
  },
  "Genesis 50:20": {
    setting: "Joseph to the brothers who sold him into slavery, after their father died in Egypt and they feared his revenge.",
    apply: "Call what happened wrong, and also look for what has grown out of it. You do not have to choose one.",
    reflect: "What good has come from a harm you never wanted?",
  },
  "Psalm 41:9": {
    setting: "A psalm attributed to David, which Jesus later quoted about Judas at the Last Supper.",
    apply: "Let yourself grieve the trust that was broken. Jesus knew this exact wound.",
    reflect: "How has this betrayal changed who you let close?",
  },
  "1 Corinthians 13:4-7": {
    setting: "Paul to a divided, competitive church in Corinth, arguing over who was most spiritual.",
    apply: "Read it with a name in place of the word charity, and notice which line you are finding hardest this week.",
    reflect: "Which line is hardest for you to live right now?",
  },
  "Ecclesiastes 4:9-10": {
    setting: "From the Teacher of Ecclesiastes, reflecting on the loneliness of people who work only for themselves.",
    apply: "Tell one person the thing you have been carrying alone. That is the whole of this passage's advice.",
    reflect: "Who would lift you up if you let them see you fall?",
  },
  "Proverbs 27:17": {
    setting: "From the proverbs of Solomon that King Hezekiah's scribes copied out centuries later.",
    apply: "Ask a friend you trust for honest feedback, and hear it without defending yourself first.",
    reflect: "Who sharpens you, and who only agrees with you?",
  },
  "1 Peter 4:8": {
    setting: "A letter bearing Peter's name, to Christians facing suffering and learning to hold together under strain.",
    apply: "Choose not to rehearse someone's failure to others this week. Cover it instead of exposing it.",
    reflect: "Whose faults have you been keeping in view?",
  },
  "Ephesians 4:2-3": {
    setting: "A letter from Paul to the church at Ephesus, urging a mixed community to keep the peace they had been given.",
    apply: "Put up with one irritating thing today without comment, and make one effort toward peace.",
    reflect: "What would it cost you to make the effort toward peace first?",
  },
  "Luke 15:20": {
    setting: "The parable of the prodigal son, told by Jesus to religious leaders grumbling that he welcomed sinners.",
    apply: "Take one step home, toward God or toward the person you left. You do not need the perfect speech first.",
    reflect: "What is keeping you a great way off?",
  },
  "Proverbs 22:6": {
    setting: "From the proverbs of Solomon, practical wisdom on raising children over a lifetime.",
    apply: "Choose one habit you want your child to carry into adulthood and practise it with them this week.",
    reflect: "What do you hope your child still carries when they are old?",
  },
  "Ephesians 6:4": {
    setting: "A letter from Paul to the church at Ephesus, in household instructions for a culture where fathers held near-absolute authority.",
    apply: "Before you next correct your child, check whether your tone is teaching or only provoking.",
    reflect: "What does your child most need from you right now?",
  },
  "Deuteronomy 6:6-7": {
    setting: "Moses to Israel on the edge of the promised land, straight after the Shema, the central confession of faith.",
    apply: "Pick one ordinary moment of the day, a meal, a drive, bedtime, to talk about faith naturally.",
    reflect: "Where in your ordinary day could these words come up without feeling forced?",
  },
  "1 Thessalonians 5:16-18": {
    setting: "Paul to a young church in Thessalonica, in what is probably his earliest surviving letter.",
    apply: "Find one thing to give thanks for in the middle of the hard thing, not after it.",
    reflect: "What can you honestly give thanks for in this situation?",
  },
  "Psalm 103:2": {
    setting: "A psalm attributed to David, calling his own soul to remember every good thing God had done.",
    apply: "Write down five specific good things from the past year before you forget them.",
    reflect: "What have you been given that you have stopped noticing?",
  },
  "James 1:17": {
    setting: "Traditionally James, the brother of Jesus, writing to believers who were blaming God for their temptations.",
    apply: "Trace one good thing in your life back to its source and say thank you to the giver.",
    reflect: "What good gift have you been treating as something you earned?",
  },
  "Nehemiah 8:10": {
    setting: "Nehemiah and Ezra to returned exiles who wept as they heard God's law read aloud.",
    apply: "Let joy be your strength today. Celebrate something good, and share it with someone who has nothing prepared.",
    reflect: "What would it mean to draw strength from joy rather than from willpower?",
  },
  "Psalm 118:24": {
    setting: "A festival hymn, the last of the Hallel psalms sung at Passover, which Jesus likely sang the night of his arrest.",
    apply: "Choose to be glad in this actual day, not a better one you are waiting for.",
    reflect: "What is good about today, as it is?",
  },
  "Proverbs 16:18": {
    setting: "From the proverbs of Solomon, a warning handed down about the fall that follows arrogance.",
    apply: "On a good day, look for where success has made you less willing to listen, and listen anyway.",
    reflect: "Where might pride be setting you up for a fall?",
  },
  "Galatians 6:4": {
    setting: "Paul to the churches in Galatia, warning believers against measuring themselves against one another.",
    apply: "Look at your own work honestly today, without measuring it against anyone else's.",
    reflect: "What would you think of your work if there were no one else's to compare it with?",
  },
  "Psalm 73:2-3": {
    setting: "Asaph, a temple musician, confessing how close envy brought him to losing his faith.",
    apply: "Say plainly who you envy and why. Naming it takes away some of its power.",
    reflect: "What does their success seem to prove about you?",
  },
  "James 4:10": {
    setting: "Traditionally James, the brother of Jesus, writing to believers striving and quarrelling for position.",
    apply: "Take the lower place in one situation today, and leave the lifting up to God.",
    reflect: "Where are you trying to lift yourself up?",
  },
  "Proverbs 14:30": {
    setting: "From the proverbs of Solomon, on how envy corrodes a person from the inside.",
    apply: "Notice where envy is eating at you, and turn it into one prayer of blessing for the person you envy.",
    reflect: "What would a settled heart look like in this situation?",
  },
  "Matthew 11:28-30": {
    setting: "Jesus speaking to ordinary people weighed down by religious demands they could never meet.",
    apply: "Put down one burden that is not yours to carry today, and take one real step toward rest.",
    reflect: "What yoke are you wearing that does not fit you?",
  },
  "Psalm 23:1-3": {
    setting: "A psalm attributed to David, who knew from experience how a good shepherd leads sheep to rest.",
    apply: "Let yourself be made to lie down. Put rest in your day as if it were an appointment.",
    reflect: "What does your soul need restored?",
  },
  "Exodus 33:14": {
    setting: "God to Moses after the golden calf, when Moses refused to lead the people on without God's presence.",
    apply: "Before the next thing, ask for presence, not just help. Then rest in that promise.",
    reflect: "What would change if you did not have to go on alone?",
  },
  "Mark 6:31": {
    setting: "Jesus to his disciples returning worn out from their first mission, so busy they had not eaten.",
    apply: "Step away today, even briefly, to a quiet place. Rest is not a reward for finishing.",
    reflect: "What would it take for you to come apart and rest a while?",
  },
  "Psalm 127:2": {
    setting: "A song of ascents attributed to Solomon, on the futility of work done without trusting God.",
    apply: "Go to bed on time tonight. Anxious overwork is not the same as faithful work.",
    reflect: "What are you afraid will happen if you rest?",
  },
  "Isaiah 40:29": {
    setting: "Comfort spoken to exiles in Babylon who felt too faint to go on.",
    apply: "Come to God today with nothing left, and ask for strength rather than waiting until you have some.",
    reflect: "What would it mean to be given strength instead of finding it?",
  },
  "Isaiah 43:18-19": {
    setting: "God to the exiles in Babylon, promising a new exodus home through the desert.",
    apply: "Stop replaying the old story for a day. Look for one small sign that something new is already starting.",
    reflect: "What new thing might be springing up that you have not yet perceived?",
  },
  "2 Corinthians 5:17": {
    setting: "Paul to the church at Corinth, a man who had once persecuted the very people he now led.",
    apply: "Do one thing today that the new you would do, even if the old you is still loud.",
    reflect: "What old thing are you still living as if it defines you?",
  },
  "Philippians 3:13-14": {
    setting: "Paul, writing from prison, a man with a violent past and every reason to be haunted by it.",
    apply: "Let go of one thing behind you by choosing today's next step instead of reliving yesterday.",
    reflect: "What behind you are you still reaching back for?",
  },
  "Genesis 12:1": {
    setting: "God's call to Abram in Haran, to leave everything familiar for a land not yet named.",
    apply: "Take the first step of the change before you have the full map. Direction comes as you go.",
    reflect: "What would you need to leave behind to go where you are being called?",
  },
  "John 14:1-3": {
    setting: "Jesus to his disciples at the Last Supper, as they began to realise he was about to leave them.",
    apply: "When the fear of death or loss comes, answer it with the plain promise here: a place is being prepared.",
    reflect: "What would it mean to believe there is room for you?",
  },
  "John 11:25-26": {
    setting: "Jesus to Martha, four days after her brother Lazarus was buried, when she told him he had come too late.",
    apply: "Bring your grief and your disappointment with God to him together, the way Martha did.",
    reflect: "Where do you feel God came too late?",
  },
  "Romans 8:38-39": {
    setting: "Paul to the church in Rome, ending a long passage on suffering with a list of everything that cannot win.",
    apply: "Name your specific fear and add it to the list in these verses. Then read them again.",
    reflect: "What are you afraid could separate you from God's love?",
  },
  "1 Corinthians 15:55": {
    setting: "Paul to the church at Corinth, where some were denying that the dead would be raised.",
    apply: "Let yourself speak to death with defiance, not only resignation, even while you grieve.",
    reflect: "What would it change to believe death does not get the last word?",
  },
  "Job 1:21": {
    setting: "Job, on the day messengers arrived one after another to tell him everything and everyone was gone.",
    apply: "You do not have to understand the loss to hold on. Grieve, and refuse to let loss define God for you.",
    reflect: "What do you still believe about God after what has been taken?",
  },
  "Matthew 5:44": {
    setting: "Jesus in the Sermon on the Mount, speaking to people living under Roman occupation.",
    apply: "Pray for your enemy by name today, and ask for one good thing for them.",
    reflect: "What would it take to want good for the person who wronged you?",
  },
  "Romans 12:18": {
    setting: "Paul to the church in Rome, on living alongside people who did not share their faith.",
    apply: "Do your part toward peace in one situation, and let go of the part that is not yours to control.",
    reflect: "How much of this peace actually depends on you?",
  },
  "Exodus 14:14": {
    setting: "Moses to the Israelites, trapped and panicking between Pharaoh's army and the Red Sea.",
    apply: "In one conflict today, stop fighting and be still. Let this be something you do not have to win yourself.",
    reflect: "Where are you exhausting yourself in a fight that is not yours?",
  },
  "Proverbs 25:21-22": {
    setting: "From the proverbs of Solomon copied by Hezekiah's scribes; Paul later quoted it in his letter to Rome.",
    apply: "Meet one practical need of someone who has been hostile to you, without expecting them to change.",
    reflect: "What does your enemy actually need that you could give?",
  },
  "Micah 7:8": {
    setting: "The prophet Micah, speaking for a fallen Jerusalem as its enemies gloated over the ruins.",
    apply: "Say out loud that you have fallen but you will rise. Say it to whatever is gloating over you.",
    reflect: "Who or what is gloating over your fall right now?",
  },
  "Psalm 37:23-24": {
    setting: "A psalm attributed to David, written as an old man's wisdom about how the righteous are upheld.",
    apply: "Get up from the stumble without treating it as final. Take tomorrow's step with your hand held.",
    reflect: "What fall are you treating as a verdict?",
  },
  "John 21:17": {
    setting: "The risen Jesus to Peter by the Sea of Galilee, after Peter had denied knowing him three times.",
    apply: "Let yourself be restored, and take up the work you thought your failure had disqualified you from.",
    reflect: "What work do you think your failure has cost you?",
  },
  "Psalm 139:13-14": {
    setting: "A psalm attributed to David, marveling at being known and formed by God before birth.",
    apply: "Say one true, thankful thing about how you are made, in place of one criticism of yourself.",
    reflect: "What about yourself do you find hardest to call wonderfully made?",
  },
  "Isaiah 43:1": {
    setting: "God to Israel in exile in Babylon, a people who had lost their land, their temple and their standing.",
    apply: "Remember you are called by name, not by role. Come to God today without your title or your record.",
    reflect: "Who are you when your role is taken away?",
  },
  "Zephaniah 3:17": {
    setting: "The prophet Zephaniah, in the seventh century BC, ending a book of judgment with a love song.",
    apply: "Let yourself be delighted in today without earning it. Rest in being sung over.",
    reflect: "What would it feel like to be rejoiced over?",
  },
  "Luke 12:7": {
    setting: "Jesus to his disciples, warning of persecution while reminding them how closely God knows them.",
    apply: "When you feel invisible, look at something small and ordinary and remember you are known in more detail than that.",
    reflect: "Where do you feel unseen?",
  },
  "1 Samuel 16:7": {
    setting: "God to the prophet Samuel, choosing a king among Jesse's sons while the youngest, David, was out with the sheep.",
    apply: "Stop measuring yourself by what others can see. Ask what God sees in your heart today.",
    reflect: "What might God see in you that others are missing?",
  },
  "Romans 15:13": {
    setting: "Paul, closing the teaching of his letter to Rome with a blessing on a divided church.",
    apply: "Ask for hope today rather than trying to generate it. Receive it as a gift.",
    reflect: "Where is your hope running low?",
  },
  "Romans 5:3-5": {
    setting: "Paul to the church in Rome, explaining how suffering is worked into hope.",
    apply: "Look for one link in the chain, endurance, character or hope, that is already forming in you.",
    reflect: "What has endurance built in you that you would not have without this?",
  },
  "Matthew 7:7": {
    setting: "Jesus in the Sermon on the Mount, teaching his disciples about persistent prayer.",
    apply: "Ask, seek and knock this week: pray the request, take one action toward it, and keep at it.",
    reflect: "What have you stopped asking for?",
  },
  "Romans 8:26": {
    setting: "Paul to the church in Rome, admitting that even he did not always know how to pray.",
    apply: "If you have no words, sit in silence before God. Let the groaning count as prayer.",
    reflect: "What would it mean that your wordless prayers are heard?",
  },
  "Psalm 62:8": {
    setting: "A psalm attributed to David, written while people around him plotted to bring him down.",
    apply: "Pour your heart out to God today, all of it, without tidying it up first.",
    reflect: "What have you not yet poured out?",
  },
  "Psalm 91:1-2": {
    setting: "An anonymous psalm of protection, long prayed by people facing danger and plague.",
    apply: "Make the refuge a place you live, not only a place you visit in emergencies. Return to it daily.",
    reflect: "What would it look like to dwell rather than visit?",
  },
  "Psalm 46:1": {
    setting: "A song of the sons of Korah, the psalm Martin Luther drew on for A Mighty Fortress Is Our God.",
    apply: "In the trouble in front of you, turn to God first rather than last.",
    reflect: "What does it mean that help is present, not distant?",
  },
  "Proverbs 18:10": {
    setting: "From the proverbs of Solomon, drawing on the image of a city's fortified tower.",
    apply: "When you feel exposed, run to God in prayer straight away, the way you would run for shelter.",
    reflect: "Where do you usually run first when you are afraid?",
  },
  "Psalm 121:1-2": {
    setting: "A song of ascents, sung by pilgrims looking up at the hills on the road to Jerusalem.",
    apply: "Look up and name where your help really comes from before you look for help anywhere else.",
    reflect: "Where have you been looking for help?",
  },
  "Hebrews 12:1-2": {
    setting: "An anonymous letter, straight after a long list of faithful people who endured before them.",
    apply: "Name one weight, not a sin, just something heavy, that you could lay aside this week to keep going.",
    reflect: "What is slowing you down that is not wrong, only heavy?",
  },
  "James 1:2-4": {
    setting: "Traditionally James, the brother of Jesus, to scattered believers facing many kinds of trials.",
    apply: "Look at your trial and ask what endurance it might be building, without pretending it does not hurt.",
    reflect: "What could this trial be making whole in you?",
  },
  "Philippians 4:13": {
    setting: "Paul, from prison, explaining how he had learned to be content with both plenty and hunger.",
    apply: "Face the thing in front of you in God's strength, whether it looks like success or only enduring.",
    reflect: "What do you need strength for today, specifically?",
  },
  "2 Timothy 4:7": {
    setting: "A letter from Paul, near the end of his life and expecting execution, to his protégé Timothy.",
    apply: "Decide today what finishing well would mean for you, and take one step toward it.",
    reflect: "What would you want to be able to say at the end?",
  },
  "Proverbs 18:21": {
    setting: "From the proverbs of Solomon, on the power words have to build up or destroy.",
    apply: "Speak one life-giving sentence to someone today, and hold back one sentence that would do harm.",
    reflect: "Whose life could your words build up this week?",
  },
  "Ephesians 4:29": {
    setting: "A letter from Paul to the church at Ephesus, on speech that builds a community rather than tearing it down.",
    apply: "Before your next hard conversation, decide what you want your words to do for the person hearing them.",
    reflect: "What would grace sound like in your next conversation?",
  },
  "Psalm 19:14": {
    setting: "A psalm attributed to David, closing a hymn about creation and God's law with a personal prayer.",
    apply: "Pray this line before you speak today, and before your mind starts rehearsing old grievances.",
    reflect: "Which of your private thoughts would you not want heard?",
  },
  "Acts 20:35": {
    setting: "Paul's farewell to the elders of Ephesus at Miletus, quoting a saying of Jesus recorded nowhere else.",
    apply: "Give something away today, time, money or attention, to someone who cannot repay you.",
    reflect: "When did giving last make you glad?",
  },
  "2 Corinthians 9:7": {
    setting: "Paul to Corinth, while organising a collection for poor believers in Jerusalem.",
    apply: "Decide in advance what you will give, freely, rather than giving under pressure or guilt.",
    reflect: "What would cheerful giving look like for you right now?",
  },
  "Proverbs 19:17": {
    setting: "From the proverbs of Solomon, on how kindness to the poor is seen by God.",
    apply: "Do one practical kindness for someone in need this week, without telling anyone about it.",
    reflect: "Who in need is close enough for you to help?",
  },
  "Proverbs 9:10": {
    setting: "From Proverbs, where Wisdom is pictured as a woman calling people to her table.",
    apply: "Before a decision this week, begin by asking what reverence for God would ask of you.",
    reflect: "What would it mean to begin with God rather than end there?",
  },
  "James 3:17": {
    setting: "Traditionally James, the brother of Jesus, contrasting wisdom from above with bitter, selfish ambition.",
    apply: "Hold your next decision up against this list and ask which quality is missing.",
    reflect: "Which of these marks of wisdom is hardest for you?",
  },
  "Ecclesiastes 7:8": {
    setting: "From the Teacher of Ecclesiastes, on patience and how things often look different at their end.",
    apply: "Do not judge this situation from the middle. Give it patience before you give it a verdict.",
    reflect: "What would you think about this if you could see its end?",
  },
  "Psalm 4:8": {
    setting: "A psalm attributed to David, an evening prayer from someone with enemies who still chose to sleep in peace.",
    apply: "Before you sleep tonight, hand the day over and say this line. Then put the phone down.",
    reflect: "What do you need to set down before you can sleep?",
  },
  "Psalm 3:5": {
    setting: "A psalm attributed to David, written while fleeing his own son Absalom, who had turned the kingdom against him.",
    apply: "Sleep is an act of trust. Lie down tonight trusting you will be sustained through it.",
    reflect: "What would let you rest tonight, before anything is resolved?",
  },
  "Psalm 63:6": {
    setting: "A psalm attributed to David, written in the wilderness of Judah.",
    apply: "When you are awake at night, turn your mind toward God in short thoughts instead of rehearsing worries.",
    reflect: "What would you think about in the night, if not the thing keeping you awake?",
  },
};

/** The passage's own living text, if the corpus has it. */
export const livingFor = (ref: string): Living | undefined => LIVING[ref];
