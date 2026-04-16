const formatOrderMessage = (order) => {

  const counts = {};

  order.forEach((offer) => {

    counts[offer.title] = (counts[offer.title] || 0) + 1;

  });

  const lines = Object.entries(counts).map(([title, count]) => {

    return count > 1 ? `${title} x${count}` : title;

  });

  return `
Tänane tellimus:

${lines.join("\n")}

Head isu!🍴
  `
}

export default formatOrderMessage;
