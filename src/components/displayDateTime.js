import { useState, useEffect } from 'react';

function DateTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  const formattedTime = currentTime.toLocaleTimeString();
  const formattedDate = currentTime.toLocaleDateString();

  return (
    <div style={{ width: '10vw', fontSize: '.85vw',display: 'flex', position:'relative', left:'7vw',top:'-1.5vw'}}>
      <div>📅 Date: {formattedDate}</div>
      <div>⏰ Time: {formattedTime}</div>
    </div>
  );
}

export default DateTimeDisplay;
