import * as React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import style from "../style/perTaskStyle.module.css";

const theme = createTheme({
  palette: {
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    primary: {
      contrastThreshold: 4.5,
      main: "#ffffff",
    },

    text: { primary: "#ffffff", secondary: "#ffffff" },
  },
});

//which task do they prefer

const marks1 = [
  {
    value: 1,
    label: "Definitely not",
  },
  {
    value: 2,
    label: "Not very much",
  },
  {
    value: 3,
    label: "No difference",
  },
  {
    value: 4,
    label: "A little",
  },
  {
    value: 5,
    label: "Definitely",
  },
];

export function InsightSlider1({ callBackValue, initialValue }) {
  const [value1, setValue1] = React.useState(initialValue);

  const handleChange = (event, newValue) => {
    setValue1(newValue);
    console.log(newValue);
    callBackValue(newValue);
  };

  return (
    <Box sx={{ width: 600 }}>
      <Box sx={{ width: 500 }}>
        <ThemeProvider theme={theme}>
          <Slider
            color="primary"
            aria-label="Always visible"
            step={1}
            marks={marks1}
            min={1}
            max={5}
            track={false}
            valueLabelDisplay="off"
            value={value1}
            onChange={handleChange}
          />
        </ThemeProvider>
      </Box>
    </Box>
  );
}

const marks2 = [
  {
    value: 1,
    label: "↓ a lot",
  },
  {
    value: 2,
    label: "↓ somewhat",
  },
  {
    value: 3,
    label: "↓ a little",
  },
  {
    value: 4,
    label: "No change",
  },
  {
    value: 5,
    label: "↑ a little",
  },
  {
    value: 6,
    label: "↑ somewhat",
  },
  {
    value: 7,
    label: "↑ a lot",
  },
];

export function InsightSlider2({ callBackValue, initialValue }) {
  const [value2, setValue2] = React.useState(initialValue);

  const handleChange = (event, newValue) => {
    setValue2(newValue);
    console.log(newValue);
    callBackValue(newValue);
  };

  return (
    <Box sx={{ width: 600 }}>
      <Box sx={{ width: 500 }}>
        <ThemeProvider theme={theme}>
          <Slider
            color="primary"
            aria-label="Always visible"
            step={1}
            marks={marks2}
            min={1}
            max={7}
            track={false}
            valueLabelDisplay="off"
            value={value2}
            onChange={handleChange}
          />
        </ThemeProvider>
      </Box>
      <span className={style.confTextLeft}>(Decreased)</span>
      <span className={style.confTextRight}>(Increased)</span>
    </Box>
  );
}

const marks3 = [
  {
    value: 1,
    label: "Not at all",
  },
  {
    value: 2,
    label: "Not much",
  },
  {
    value: 3,
    label: "Somewhat",
  },
  {
    value: 4,
    label: "Quite a bit",
  },
  {
    value: 5,
    label: "A lot",
  },
];

export function InsightSlider3({ callBackValue, initialValue }) {
  const [value3, setValue3] = React.useState(initialValue);

  const handleChange = (event, newValue) => {
    setValue3(newValue);
    console.log(newValue);
    callBackValue(newValue);
  };

  return (
    <Box sx={{ width: 600 }}>
      <Box sx={{ width: 500 }}>
        <ThemeProvider theme={theme}>
          <Slider
            color="primary"
            aria-label="Always visible"
            step={1}
            marks={marks3}
            min={1}
            max={5}
            track={false}
            valueLabelDisplay="off"
            value={value3}
            onChange={handleChange}
          />
        </ThemeProvider>
      </Box>
    </Box>
  );
}
