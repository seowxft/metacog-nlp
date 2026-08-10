import * as React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import style from "../style/perTaskStyle.module.css";

const theme = createTheme({
  palette: {
    primary: {
      contrastThreshold: 4.5,
      main: "#ffffff",
    },
    text: { primary: "#ffffff", secondary: "#ffffff" },
  },
});

// Helper function to generate exactly 5 evenly spaced marks
const generateMarks = (max) => {
  const step = max / 4;
  return [
    { value: 0, label: "0" },
    { value: Math.round(step), label: String(Math.round(step)) },
    { value: Math.round(step * 2), label: String(Math.round(step * 2)) },
    { value: Math.round(step * 3), label: String(Math.round(step * 3)) },
    { value: max, label: String(max) },
  ];
};

export function ConfSliderGlobal({ callBackValue, initialValue, max }) {
  const [value, setValue] = React.useState(initialValue);

  // Recalculate marks only when the max value changes
  const dynamicMarks = React.useMemo(() => generateMarks(max), [max]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
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
            marks={dynamicMarks}
            min={0}
            max={max}
            track={false}
            valueLabelDisplay="on"
            value={value}
            onChange={handleChange}
          />
        </ThemeProvider>
      </Box>
      <span className={style.confTextLeft}>All wrong</span>
      <span className={style.confTextMiddle}>Chance level</span>
      <span className={style.confTextRight}>All correct</span>
    </Box>
  );
}
