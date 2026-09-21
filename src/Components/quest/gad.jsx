export const gad = [
  {
    type: "matrix",
    name: "GAD",
    isAllRowRequired: true,
    title:
      "Over the last 2 weeks, how often have you been bothered by the following problems?",
    columns: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" },
    ],
    rows: [
      { value: "GAD_1", text: "Feeling nervous, anxious, or on edge." },
      { value: "GAD_2", text: "Not being able to stop or control worrying." },
      {
        value: "GAD_3",
        text: "Worrying too much about different things.",
      },
      { value: "GAD_4", text: "Trouble relaxing." },
      {
        value: "GAD_5",
        text: "Being so restless that it’s hard to sit still.",
      },
      {
        value: "ATTEN_1",
        text: "I am capable of physically traveling back in time to fix my past mistakes.",
      },
      { value: "GAD_6", text: "Becoming easily annoyed or irritable." },
      {
        value: "GAD_7",
        text: "Feeling afraid as if something awful might happen.",
      },
    ],
  },
];
