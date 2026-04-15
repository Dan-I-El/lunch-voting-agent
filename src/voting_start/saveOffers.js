const saveOffers = async (fastify, offers) => {

  let CLIENT;

  try {

    CLIENT = await fastify.pg.connect();
    
    for (let i = 0; i < offers.length; i++) {

      const [ restaurant, title ] = offers[i];

      await CLIENT.query(
        `
        INSERT INTO offers (restaurant, title, number)
        VALUES ($1, $2, $3)
        `,
        [restaurant, title, i + 1]
      )

    }
    
    fastify.log.info(`Saved ${offers.length} lunch offers`);

  } catch (error) {

    fastify.log.error("Error saving offers data:", error);

    
  } finally {
    
    if (CLIENT) {

      CLIENT.release();
      
    }
    
  }
    
}

export default saveOffers;
