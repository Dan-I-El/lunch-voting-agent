function parseVoteMessage(input) {

  if (typeof input !== "string" || input.trim() === "") {
    throw new Error("Input must be a non-empty string.");
  }

  const trimmed = input.trim();

  // Strict pattern:
  // - Single number: "3"
  // - Pipe-separated: "4|5|6"
  // - Comma-separated: "4,5,6"
  // - No mixing separators
  // - No empty values
  // - Integers or decimals allowed
  const validPattern = /^(\d+)([\|,](\d+))*$/;

  if (!validPattern.test(trimmed)) {
    throw new Error("Wrong format.");
  }

  const isBulk = trimmed.includes(",");
  const isSlash = trimmed.includes("|");

  // Prevent mixing separators explicitly (extra safety)
  if (isBulk && isSlash) {
    throw new Error("Invalid format: cannot mix ',' and '|'.");
  }

  let votesList;

  if (isBulk) {
    votesList = trimmed.split(",");
  } else if (isSlash) {
    votesList = trimmed.split("|");
  } else {
    votesList = [trimmed];
  }

  const numbers = votesList.map((vote, index) => {

    const number = Number(vote);

    if (!Number.isFinite(number)) {
      throw new Error(
        `Invalid value "${vote}" at position ${index + 1}.`
      );
    }

    return [number, isBulk];
  });

  return numbers;
}

export default parseVoteMessage;
