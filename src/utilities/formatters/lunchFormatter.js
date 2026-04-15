const formatLunchList = (offers) => {

  const lines = offers.map((offer, index) => {

    const line = `${index + 1}. ${offer[0]} — ${offer[1]}`;

    return line;

  });

  return `
Tänased lõunapakkumised: 🍴

${lines.join("\n")}
  `
}

export default formatLunchList;
