const getChosenOffers = async (fastify) => {

  const chosenOffers = await fastify.pg.query(`
    WITH today_votes AS (
        SELECT v.person, v.id, o.restaurant, o.title, v.created_at, v.bulk
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
            tv.bulk,
            ROW_NUMBER() OVER (
                PARTITION BY tv.person 
                ORDER BY tv.created_at DESC
            ) AS rn,
            BOOL_OR(tv.bulk) OVER (PARTITION BY tv.person) AS has_bulk
        FROM today_votes tv
        JOIN top_restaurant tr 
            ON tv.restaurant = tr.restaurant
    )
    SELECT title
    FROM ranked_choices
    WHERE 
        (has_bulk = true)   -- return all rows for that user
        OR 
        (has_bulk = false AND rn = 1) -- otherwise only latest
    ORDER BY person;
  `);


  return chosenOffers.rows;

}

export default getChosenOffers;
