//Short consent for quick debugging

export const json = {
  title: null,
  pages: [
    {
      questions: [
        { type: "html", name: "info", html: "" },
        {
          type: "html",
          name: "info",
          html: "<b>Who is conducting this research study?</b>",
        },

        {
          type: "html",
          name: "info",
          html: "<p>This research is being conducted by the Wellcome Centre for Human Neuroimaging and the Max Planck UCL Centre for Computational Psychiatry and Ageing Research. The lead researchers for this project are Dr. Tricia Seow (Research Fellow, t.seow@ucl.ac.uk) and Dr. Tobias Hauser (Principal Investigator, t.hauser@ucl.ac.uk). This study has been approved by the UCL Research Ethics Committee (project ID number 15301&#92;001) and funded by the Wellcome Trust.</p>",
        },
      ],
    },
    {
      questions: [
        {
          type: "checkbox",
          name: "checkbox1",
          title:
            "I have read the information above, and understand what the study involves.",
          isRequired: true,
          choices: ["Yes"],
        },
      ],
    },
  ],
};
