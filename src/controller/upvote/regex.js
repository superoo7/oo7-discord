// MARKDOWN REGEX

// MAIN
// BODY->IMAGE->

// IMAGE: ![]()

function imageParser(textBody) {
  var re = /!\[([^\]]*)]\(([^\)]*)\)/g;
  const returnVal = textBody.replace(re, '');
  return returnVal;
}

// LINK: []()
function linkParser(textBody) {
  let re = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/g;
  const returnVal = textBody.replace(re, '');
  return returnVal;
}

// DIV: <div class="pull-left"></div> <center></center>
function divParser(textBody) {
  return;
}

// <br><hr>
function breakLineParser(textBody) {
  return;
}

export {
  imageParser,
  linkParser,
  divParser,
  breakLineParser
};
