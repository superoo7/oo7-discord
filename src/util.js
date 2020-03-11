let getDateTimeFromTimestamp = unixTimeStamp => {
  var date = new Date(unixTimeStamp);
  return (
    ("0" + date.getDate()).slice(-2) +
    "/" +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    "/" +
    date.getFullYear() +
    " " +
    ("0" + date.getHours()).slice(-2) +
    ":" +
    ("0" + date.getMinutes()).slice(-2)
  );
};

let timeConvertMessage = ({ hours: h, minutes: m, seconds: s }) =>
  `${h !== 0 ? `${h} hours and ` : ""}${
    m !== 0 ? `${m} minutes and ` : ""
  }${s} seconds`;

export { getDateTimeFromTimestamp, timeConvertMessage };
