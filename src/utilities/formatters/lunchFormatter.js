const formatLunchList = (offers) => {

  const grouped = offers.reduce((acc, [restaurantTitle, offer]) => {

    if (!acc[restaurantTitle]) {

      acc[restaurantTitle] = [];

    }

    acc[restaurantTitle].push(offer);

    return acc;

  }, {});

  let counter = 1;

  const lines = Object.entries(grouped).map(([restaurantTitle, offers]) => {

    const offersList = offers.map((offer) => {

      const line = `_${counter}._ ${offer}`;

      counter++;

      return line;

    }).join("\n");

    return `*${restaurantTitle}*:\n${offersList}\n`;
  });

  return `Tänased lõunapakkumised: 🍴\n\n${lines.join("\n")}`;
};

export default formatLunchList;
