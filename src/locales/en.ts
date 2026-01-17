export const en = {
  common: {
    back: 'Back',
    continue: 'Continue',
    save: 'Save',
    cancel: 'Cancel',
    send: 'Send',
    loading: 'Loading...',
    age: 'Age',
    ageValue: 'Age {age}',
    disclaimer: 'Not a substitute for professional advice',
    settings: 'Settings',
    language: 'Language',
    hebrew: 'עברית',
    english: 'English',
  },
  home: {
    situationButton: "There's a situation now",
    myChildren: 'My Children',
    addChild: 'Add Child',
  },
  selectChild: {
    title: 'Which child is this about?',
    addNewChild: 'Add New Child',
  },
  addChild: {
    title: 'Add Child',
    childName: "Child's Name",
    enterName: 'Enter name',
    age: 'Age',
    agePlaceholder: '0-18',
    genderOptional: 'Gender (optional)',
    boy: 'Boy',
    girl: 'Girl',
    characteristics: 'Main Characteristics',
    characteristicsPlaceholder: 'e.g., sensitive, energetic, loves games...',
    notesOptional: 'Additional Notes (optional)',
    notesPlaceholder: 'Additional information that could help...',
    saveAndContinue: 'Save and Continue',
    requiredField: 'Required field',
    ageError: 'Age must be between 0-18',
  },
  context: {
    title: "What's the context?",
    location: 'Location',
    whoPresent: "Who's present?",
    privacy: 'Privacy',
    yourMood: 'Your mood',
    locations: {
      home: 'Home',
      street: 'Street',
      car: 'Car',
      mall: 'Mall',
      restaurant: 'Restaurant',
    },
    presence: {
      alone: 'Alone',
      spouse: 'Spouse',
      other_adults: 'Other adults',
      strangers: 'Strangers',
    },
    physicality: {
      private: 'Private',
      public: 'Public',
    },
    emotionalState: {
      calm: 'Calm',
      frustrated: 'Frustrated',
      angry: 'Angry',
      anxious: 'Anxious',
    },
  },
  describe: {
    title: "What's happening?",
    subtitle: 'Briefly describe the situation',
    placeholder: "e.g., My child doesn't want to get dressed for school and starts screaming...",
    stopRecording: 'Stop recording',
    voiceRecording: 'Voice recording',
    recording: 'Recording...',
    characters: '{count} characters (minimum 10)',
  },
  clarification: {
    title: 'Clarification Question',
    yes: 'Yes',
    no: 'No',
    sometimes: 'Sometimes',
    notSure: 'Not sure',
    skipAndContinue: 'Skip and continue',
    questions: {
      tellMore: 'Can you tell me more about what happened?',
      externalPressure: 'Is there external pressure from the environment?',
      frequency: 'Does this happen often or is it the first time?',
    },
  },
  response: {
    processing: 'Processing the situation...',
    processingTime: 'This takes 5-10 seconds',
    error: 'Something went wrong',
    backHome: 'Back Home',
    title: "Here's what to do",
    whatToDo: 'What to do now',
    whatNotToDo: 'What not to do',
    whatToSay: 'What to say',
    didItHelp: 'Did this advice help?',
    helped: 'Helped',
    notHelped: "Didn't help",
    followUpPrompt: "Tell me what happened, and I'll try a different approach:",
    followUpPlaceholder: "e.g., She's barricaded and won't get dressed...",
    thinkingNewApproach: 'Thinking of a different approach...',
    gladToHelp: 'Glad to help! Good luck',
    newSituation: 'New Situation',
  },
  ai: {
    systemPrompt: `You are a professional and experienced parenting consultant. Your role is to help parents deal with challenging situations with their children.`,
    childInfo: 'Information about the child:',
    name: 'Name',
    age: 'Age',
    gender: 'Gender',
    boy: 'Boy',
    girl: 'Girl',
    characteristics: 'Characteristics',
    notes: 'Notes',
    situationContext: 'Situation context:',
    location: 'Location',
    presence: 'Presence',
    privacy: 'Privacy',
    parentMood: "Parent's emotional state",
    situationDescription: 'Description of the situation:',
    additionalClarifications: 'Additional clarifications:',
    responseInstructions: `Please provide a practical and actionable response in the following JSON format:
{
  "doNow": "What to do now - short and clear instructions (2-3 sentences)",
  "dontDo": "What not to do - behaviors to avoid (2-3 sentences)",
  "sayThis": "One specific phrase to say to the child - warm and natural"
}`,
    important: `Important:
- The response should be age-appropriate
- Be brief and practical
- Focus on immediate actions
- Consider the context and parent's emotional state
- Use warm and supportive language`,
    followUpSystemPrompt: `You are a professional and experienced parenting consultant. The parent received advice but it didn't help, and they're asking for additional help.`,
    previousAdvice: 'Advice',
    whatToDo: 'What to do',
    whatNotToDo: 'What not to do',
    whatToSay: 'What to say',
    parentFeedback: 'Parent feedback',
    originalDescription: 'Original situation description:',
    adviceHistory: 'History of previous advice:',
    newFeedback: 'New feedback from the parent:',
    tryDifferentApproach: `Please provide new and different advice, considering that the previous advice didn't work.
Try a different approach!`,
    followUpResponseFormat: `JSON format:
{
  "doNow": "What to do now - new and different approach (2-3 sentences)",
  "dontDo": "What not to do (2-3 sentences)",
  "sayThis": "One specific phrase to say to the child - different from before"
}`,
  },
  mockResponses: {
    tantrums: [
      {
        doNow: "Get down to your child's eye level, take a deep breath, and stay calm. Your quiet presence is more calming than any words.",
        dontDo: "Don't yell back and don't try to explain right now. The child is in an emotional state and can't process explanations.",
        sayThis: 'I can see you are very angry right now. I am here with you.',
      },
      {
        doNow: "Make sure the child is in a safe place, and stay close without directly intervening. Let the tantrum pass.",
        dontDo: "Don't try to stop the crying by force or distract them immediately. This prevents emotional processing.",
        sayThis: "When you're ready, I'm here for a hug.",
      },
    ],
    refusal: [
      {
        doNow: 'Offer two acceptable choices. A sense of choice reduces resistance.',
        dontDo: "Don't enter a power struggle or make threats. This only increases resistance.",
        sayThis: 'Would you prefer to do X or Y first?',
      },
      {
        doNow: "Acknowledge their desire even if you can't fulfill it. Listening reduces struggles.",
        dontDo: "Don't ignore or dismiss their desire. Even if the answer is no, they need to feel heard.",
        sayThis: "I understand you want... Now we need to... Let's find a solution together.",
      },
    ],
    violence: [
      {
        doNow: 'Stop the physical action gently but firmly. The boundary must be clear and immediate.',
        dontDo: "Don't hit back and don't yell. A violent response teaches that violence is a solution.",
        sayThis: "I won't let you hit. Hitting hurts. I'm here to help you calm down.",
      },
    ],
    fear: [
      {
        doNow: "Accept the fear without trying to convince them there's nothing to fear. Provide a calming presence.",
        dontDo: "Don't say \"there's nothing to be afraid of\" - this dismisses their feelings and doesn't help.",
        sayThis: "I understand this scares you. I'm here with you and I'll keep you safe.",
      },
    ],
    homework: [
      {
        doNow: 'Sit beside them and let them lead. Ask where they are stuck instead of explaining immediately.',
        dontDo: "Don't do the homework for them and don't pressure too much. This hurts motivation.",
        sayThis: "Let's look at this together. What's the hardest part here?",
      },
    ],
    food: [
      {
        doNow: 'Offer the food without pressure and continue with your meal. Children sense pressure and refuse more.',
        dontDo: "Don't force eating and don't use dessert as a reward. This creates a problematic relationship with food.",
        sayThis: "The food is here when you're ready. Your body knows when it's hungry.",
      },
    ],
    sleep: [
      {
        doNow: 'Create a consistent calming routine: bath, book, song. Clear expectations ease the transition.',
        dontDo: "Don't allow screens an hour before bedtime. Blue light interferes with falling asleep.",
        sayThis: "Your body is tired and needs rest. Let's get ready for sleep together.",
      },
    ],
    siblings: [
      {
        doNow: "Separate the children if needed, but don't look for blame. Let each one tell their side.",
        dontDo: "Don't compare them and don't say \"why can't you be like...\" - this increases competition.",
        sayThis: "I can see you're both frustrated. Let's find a solution that works for everyone.",
      },
    ],
    default: [
      {
        doNow: "Stop, breathe, and observe what's happening. Sometimes a moment of quiet helps more than any action.",
        dontDo: "Don't react out of anger or frustration. An emotional response sends an unwanted message.",
        sayThis: "I can see something is hard for you right now. Tell me about it.",
      },
      {
        doNow: 'Connect with your child emotionally before trying to solve the problem.',
        dontDo: "Don't jump to solutions before the child feels heard.",
        sayThis: "I understand this feels hard. I'm here with you.",
      },
    ],
  },
};
