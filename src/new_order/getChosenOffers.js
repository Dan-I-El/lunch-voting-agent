const getChosenOffers = async (fastify) => {

    // TODO - check if timezone is always correct
  const chosenOffers = await fastify.pg.query(`
    WITH today_votes AS (
        SELECT v.person, v.id, o.restaurant, o.title, v.created_at
        FROM votes v
        JOIN offers o ON v.id = o.id
        WHERE v.created_at >= CURRENT_DATE
          AND v.created_at < CURRENT_DATE + INTERVAL '1 day'
    ),
    top_restaurant AS (
        SELECT restaurant
        FROM today_votes
        GROUP BY restaurant
        ORDER BY COUNT(*) DESC
        LIMIT 1
    ),
    ranked_choices AS (
        SELECT 
            tv.person,
            tv.title,
            ROW_NUMBER() OVER (
                PARTITION BY tv.person 
                ORDER BY tv.created_at DESC
            ) AS rn
        FROM today_votes tv
        JOIN top_restaurant tr 
            ON tv.restaurant = tr.restaurant
    )
    SELECT title
    FROM ranked_choices
    WHERE rn = 1
    ORDER BY person;
  `);


  return chosenOffers.rows;

}

export default getChosenOffers;
