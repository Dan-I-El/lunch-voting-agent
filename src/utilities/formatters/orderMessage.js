const formatOrderMessage = (order) => {

  const lines = order.map((offer) => {

    return offer.title;

  });
  // TODO - it should stack the same dishes by name and show quantity
  return `
Tänane tellimus:

${lines.join("\n")}

Head isu!🍴
  `
}

export default formatOrderMessage;
