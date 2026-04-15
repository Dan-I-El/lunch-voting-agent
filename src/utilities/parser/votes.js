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

  const votesList = trimmed.split(/[,\/]/);

  const numbers = votesList.map((vote, index) => {
    
    const trimmedVote = vote.trim();

    if (trimmedVote === "") {

      throw new Error(`Invalid format: empty value at position ${index + 1}.`);

    }

    const number = Number(trimmedVote);

    if (isNaN(number)) {

      throw new Error(`Invalid value "${trimmedVote}" at position ${index + 1}: not a number.`);

    }

    return number;
  });

  return numbers;
}

export default parseVoteMessage;
