export function isThereAQuote(content) {
  if (content.startsWith("@")) {
    let quote = extractQuote(content);
    return { bool: true, quote: quote };
  }
  return { bool: false, quote: null };
}

export function extractQuote(content) {
  let stringArray = [...content.split(" ")];
  return stringArray[0];
}

export function extractContent(content) {
  let stringArray = [...content.split(" ")];
  return stringArray.slice(1).join(" ");
}

export function doesQuoteMatchWithUsername(quote, replyingTo) {
  if (replyingTo.startsWith("@") === false) {
    let newReplyingTo = "@".concat(replyingTo);
    return quote === newReplyingTo;
  }
  return quote === replyingTo;
}

/**
 *
 * @param {*} quote
 * @returns
 */
export function doesQuoteMatchDatabase(quote, usernames) {
  return usernames.includes(quote.slice(1));
}
