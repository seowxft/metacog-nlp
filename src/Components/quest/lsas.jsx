export const lsas = [
  {
    type: "matrixdropdown",
    name: "LSAS",
    title:
      "For each question, select the answer that best describes your thoughts, feelings, and actions.",
    columns: [
      {
        name: "fear",
        title: "Fear",
        isRequired: true,
        choices: [
          { value: 0, text: "None" },
          { value: 1, text: "Mild" },
          { value: 2, text: "Moderate" },
          { value: 3, text: "Severe" },
        ],
        cellType: "radiogroup",
      },
      {
        name: "avoidance",
        title: "Avoidance",
        isRequired: true,
        choices: [
          { value: 0, text: "Never" },
          { value: 1, text: "Occassionally" },
          { value: 2, text: "Often" },
          { value: 3, text: "Usually" },
        ],
        cellType: "radiogroup",
      },
    ],
    rows: [
      {
        value: "LSAS_1",
        text: "Telephoning in public.",
      },
      {
        value: "LSAS_2",
        text: "Participating in small groups.",
      },
      {
        value: "LSAS_3",
        text: "Eating in public places.",
      },
      {
        value: "LSAS_4",
        text: "Drinking with others in public places.",
      },
      {
        value: "LSAS_5",
        text: "Talking to people in authority.",
      },
      {
        value: "LSAS_6",
        text: "Acting, performing or giving a talk in front of an audience.",
      },
      {
        value: "LSAS_7",
        text: "Going to a party.",
      },
      {
        value: "LSAS_8",
        text: "Working while being observed.",
      },
      { value: "LSAS_9", text: "Writing while being observed." },
      {
        value: "LSAS_10",
        text: "Calling someone you don't know very well.",
      },
      {
        value: "LSAS_11",
        text: "Talking with people you don't know very well.",
      },
      {
        value: "LSAS_12",
        text: "Meeting strangers.",
      },
      {
        value: "LSAS_13",
        text: "Urinating in a public bathroom.",
      },
      {
        value: "LSAS_14",
        text: "Entering a room when others are already seated.",
      },
      {
        value: "LSAS_15",
        text: "Being the center of attention.",
      },
      {
        value: "LSAS_16",
        text: "Speaking up at a meeting.",
      },

      { value: "LSAS_17", text: "Taking a test." },
      {
        value: "LSAS_18",
        text:
          "Expressing a disagreement or disapproval to people you don't know very well.",
      },
      {
        value: "LSAS_19",
        text: "Looking at people you don't know very well in the eyes.",
      },
      { value: "LSAS_20", text: "Giving a report to a group." },
      { value: "LSAS_21", text: "Trying to pick up someone." },
      {
        value: "LSAS_22",
        text: "Returning goods to a store.",
      },
      { value: "LSAS_23", text: "Giving a party." },
      { value: "LSAS_24", text: "Resisting a high pressure salesperson." },
    ],
  },
];
