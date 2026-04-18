function parseVoteMessage(input) {

  if (typeof input !== "string" || input.trim() === "") {

    throw new Error("Input must be a non-empty string.");

  }

  const trimmed = input.trim();

  // Validate: only digits, dots (decimals), commas, slashes, and surrounding whitespace allowed
  if (!/^[\d\s.,\/]+$/.test(trimmed)) {

    throw new Error(
      `Invalid format: only numbers separated by ',' or '/' are supported.`
    );

  }

  let votesList;

  const THIS_IS_BULK = trimmed.includes(",");

  if (THIS_IS_BULK) {

    votesList = trimmed.split(",");

  } else if (trimmed.includes("/")) {

    votesList = trimmed.split("/");

  } else {

    votesList = [trimmed];
    
  }

  const numbers = votesList.map((vote, index) => {
    
    const trimmedVote = vote.trim();

    if (trimmedVote === "") {

      throw new Error(`Invalid format: empty value at position ${index + 1}.`);

    }

    const number = Number(trimmedVote);

    if (isNaN(number)) {

      throw new Error(`Invalid value "${trimmedVote}" at position ${index + 1}: not a number.`);

    }

    return [ number, THIS_IS_BULK ];
    
  });

  return numbers;
  
}

export default parseVoteMessage;
