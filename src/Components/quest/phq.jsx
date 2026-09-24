export const phq = [
  {
    type: "matrix",
    name: "PHQ",
    isAllRowRequired: true,
    title:
      "How often have you been bothered by the following over the past 2 weeks?",
    columns: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" },
    ],
    rows: [
      { value: "PHQ_1", text: "Little interest or pleasure in doing things." },
      { value: "PHQ_2", text: "Feeling down, depressed, or hopeless." },
      {
        value: "PHQ_3",
        text: "Trouble falling or staying asleep, or sleeping too much.",
      },
      { value: "PHQ_4", text: "Feeling tired or having little energy." },

      { value: "PHQ_5", text: "Poor appetite or overeating." },
      {
        value: "PHQ_6",
        text: "Feeling bad about yourself, or that you are a failure or have let yourself or your family down.",
      },
      {
        value: "PHQ_7",
        text: "Trouble concentrating on things, such as reading the newspaper or watching television.",
      },
      {
        value: "PHQ_8",
        text: "Moving or speaking so slowly that other people could have noticed, or so fidgety or restless that you have been moving a lot more than usual.",
      },
      {
        value: "ATTEN_2",
        text: "Breathing or engaging in other normal bodily functions.",
      },
      {
        value: "PHQ_9",
        text: "Thoughts that you would be better off dead, or thoughts of hurting yourself in some way.",
      },
    ],
  },
];
