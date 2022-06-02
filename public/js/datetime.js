module.exports.getDate = () =>{
  var today = new Date();
  var currentDay = today.getDay();
  var day = '';

  var options = {
    day: "numeric",
    month: "long",
    year: "numeric"
  }

  var todaysDate = today.toLocaleDateString("en-US", options);
  return todaysDate
}

module.exports.getDay = () =>{
  var today = new Date();
  var currentDay = today.getDay();
  var day = '';

  var options = {
    day: "numeric",
    month: "long",
    weekday: "long"
  }

  var todaysDate = today.toLocaleDateString("en-US", options);
  return todaysDate
}

module.exports.convertTimeZone = (offset) =>{
  var d = new Date();
  localTime = d.getTime();
  localOffset = d.getTimezoneOffset()
  localOffset *= 60000;

  utc = localTime + localOffset;

  nd = new Date(utc + (3600000 * offset));

  return nd.toLocaleString();
  
}
