import { useEffect, useState } from 'react';

const CountdownTimer = (props) => {
  const { initialHour = 0, initialMinute = 0, initialSecond = 0 } = props;
  const [hours, setHours] = useState(initialHour);
  const [minutes, setMinutes] = useState(initialMinute);
  const [seconds, setSeconds] = useState(initialSecond);
  useEffect(() => {
    let myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          if (hours > 0) {
            setHours(hours - 1);
            setMinutes(59);
            setSeconds(59);
          } else {
            clearInterval(myInterval);
          }
        }
      }
    }, 1000);
    return () => {
      clearInterval(myInterval);
    };
  });

  return (
    <span>
      {hours <= 0 && minutes <= 0 && seconds <= 0 ? (
        <i>Auction has already expired</i>
      ) : (
        <b>
          {hours.toString().padStart(2, '0')}:
          {minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}
        </b>
      )}
    </span>
  );
};

export default CountdownTimer;
