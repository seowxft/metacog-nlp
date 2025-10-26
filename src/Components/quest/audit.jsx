export const audit = [
  {
    type: "radiogroup",
    name: "AUDIT_1",
    isRequired: true,
    title: "How often do you have a drink containing alcohol?",
    //colCount: 4,
    choices: [
      { value: 0, text: "Never" },
      { value: 1, text: "Monthly or less" },
      { value: 2, text: "Two to four times a month" },
      { value: 3, text: "Two to three times a week" },
      { value: 4, text: "Four or more times a week" },
    ],
  },

  {
    type: "radiogroup",
    name: "AUDIT_2",
    isRequired: true,
    title:
      "How many drinks containing alcohol do you have on a typical day when you are drinking?",
    choices: [
      { value: 0, text: "1 or 2" },
      { value: 1, text: "3 or 4" },
      { value: 2, text: "5 or 6" },
      { value: 3, text: "7 or 9" },
      { value: 4, text: "10 or more" },
    ],
  },

  {
    type: "radiogroup",
    name: "AUDIT_3",
    isRequired: true,
    title: "How often do you have six or more drinks on one occasion?",
    choices: [
      { value: 0, text: "Never" },
      { value: 1, text: "Less than monthly" },
      { value: 2, text: "Monthly" },
      { value: 3, text: "Weekly" },
      { value: 4, text: "Daily or almost daily" },
    ],
  },

  {
    type: "radiogroup",
    name: "AUDIT_4",
    isRequired: true,
    title:
      "How often during the last year have you found that you were not able to stop drinking once you had started?",
    choices: [
      { value: 0, text: "Never" },
      { value: 1, text: "Less than monthly" },
      { value: 2, text: "Monthly" },
      { value: 3, text: "Weekly" },
      { value: 4, text: "Daily or almost daily" },
    ],
  },

  {
    type: "radiogroup",
    name: "AUDIT_5",
    isRequired: true,
    title:
      "How often during the last year have you failed to do what was normally expected from you because of drinking?",
    choices: [
      { value: 0, text: "Never" },
      { value: 1, text: "Less than monthly" },
      { value: 2, text: "Monthly" },
      { value: 3, text: "Weekly" },
      { value: 4, text: "Daily or almost daily" },
    ],
  },

  {
    type: "radiogroup",
    name: "AUDIT_6",
    isRequired: true,
    title:
      "How often during the last year have you needed a first drink in the morning to get yourself going after a heavy drinking session?",
    choices: [
      { value: 0, text: "Never" },
      { value: 1, text: "Less than monthly" },
      { value: 2, text: "Monthly" },
      { value: 3, text: "Weekly" },
      { value: 4, text: "Daily or almost daily" },
    ],
  },

  {
    type: "radiogroup",
    name: "AUDIT_7",
    isRequired: true,
    title:
      "How often during the last year have you had a feeling of guilt or remorse after drinking?",
    choices: [
      { value: 0, text: "Never" },
      { value: 1, text: "Less than monthly" },
      { value: 2, text: "Monthly" },
      { value: 3, text: "Weekly" },
      { value: 4, text: "Daily or almost daily" },
    ],
  },

  {
    type: "radiogroup",
    name: "AUDIT_8",
    isRequired: true,
    title:
      "How often during the last year have you been unable to remember what happened the night before because you had been drinking?",
    choices: [
      { value: 0, text: "Never" },
      { value: 1, text: "Less than monthly" },
      { value: 2, text: "Monthly" },
      { value: 3, text: "Weekly" },
      { value: 4, text: "Daily or almost daily" },
    ],
  },

  {
    type: "radiogroup",
    name: "AUDIT_9",
    isRequired: true,
    title:
      "Have you or someone else been injured as a result of your drinking?",
    choices: [
      { value: 0, text: "No" },
      { value: 2, text: "Yes, but not in the last year" },
      { value: 4, text: "Yes during the last year" },
    ],
  },

  {
    type: "radiogroup",
    name: "AUDIT_10",
    isRequired: true,
    title:
      "Has a relative or friend, or a doctor or other health worker been concerned about your drinking or suggested you cut down?",
    choices: [
      { value: 0, text: "No" },
      { value: 2, text: "Yes, but not in the last year" },
      { value: 4, text: "Yes during the last year" },
    ],
  },

  {
    type: "radiogroup",
    name: "AUDIT_11",
    isRequired: true,
    title: "Do you smoke cigarettes?",
    choices: [
      { value: 0, text: "No" },
      { value: 1, text: "Fewer than 1 stick per day" },
      { value: 2, text: "1-5 sticks per day" },
      { value: 3, text: "5-10 sticks per day" },
      { value: 4, text: "10-20 sticks per day" },
      { value: 5, text: "20-30 sticks per day" },
      { value: 6, text: "More than 30 sticks per day" },
    ],
  },
  {
    type: "radiogroup",
    name: "AUDIT_12",
    isRequired: true,
    title: "Do you vape?",
    choices: [
      { value: 0, text: "No" },
      { value: 1, text: "1 to 12 times a year" },
      { value: 2, text: "1 to 4 times a month" },
      { value: 3, text: "More than once a week" },
      { value: 4, text: "Daily" },
    ],
  },
  {
    type: "radiogroup",
    name: "AUDIT_13",
    title:
      "What strength of nicotine do you vape? (If you do not vape, select N/A)",
    isRequired: true,
    choices: [
      { value: 0, text: "N/A" },
      { value: 1, text: "0 mg" },
      { value: 2, text: "1-3 mg" },
      { value: 3, text: "4-6 mg" },
      { value: 4, text: "7-10 mg" },
      { value: 5, text: "11-15 mg" },
      { value: 6, text: "16-20 mg" },
      { value: 7, text: ">20 mg" },
    ],
  },
];
