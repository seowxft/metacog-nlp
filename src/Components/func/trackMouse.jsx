import React from "react";

const trackMouse = () => {
  // Ref to hold the array of data points. Does not cause re-renders.
  const mouseDataRef = React.useRef([]);

  // Ref to hold the timestamp when tracking was last started.
  const startTimeRef = React.useRef(null);

  // State to determine if tracking is currently active (useful for UI).
  const [isTracking, setIsTracking] = React.useState(false);

  // Ref to hold the event listener function, necessary for proper cleanup.
  const handlerRef = React.useRef(null);

  // --- Core Tracking Logic ---
  const updateMousePosition = React.useCallback((ev) => {
    if (!startTimeRef.current) return; // Should not happen if called correctly

    const timestamp = performance.now() - startTimeRef.current; // Time relative to start

    // Add the data point to the ref array
    mouseDataRef.current.push({
      t: Math.round(timestamp),
      x: ev.clientX,
      y: ev.clientY,
    });
  }, []); // useCallback ensures this function definition is stable

  // --- Control Functions ---

  const startTracking = () => {
    if (isTracking) return;

    // Reset data and set new start time
    mouseDataRef.current = [];
    startTimeRef.current = performance.now();

    // Set up the event listener
    handlerRef.current = updateMousePosition;
    window.addEventListener("mousemove", handlerRef.current);

    setIsTracking(true);
    console.log("Mouse tracking started.");
  };

  const stopTracking = () => {
    if (!isTracking || !handlerRef.current) return;

    // Remove the event listener
    window.removeEventListener("mousemove", handlerRef.current);

    setIsTracking(false);
    console.log("Mouse tracking stopped.");
  };

  const getMovementString = () => {
    // Generate the string from the current data array
    return mouseDataRef.current
      .map((point) => `${point.t},${point.x},${point.y}`)
      .join(";");
  };

  // Cleanup on component unmount
  React.useEffect(() => {
    return () => {
      // Ensure the listener is removed if the component unmounts while tracking
      if (handlerRef.current) {
        window.removeEventListener("mousemove", handlerRef.current);
      }
    };
  }, []);

  // Return the necessary controls and data accessors
  return { isTracking, startTracking, stopTracking, getMovementString };
};

export default trackMouse;
