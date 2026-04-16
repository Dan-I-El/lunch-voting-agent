const calculateWinner = async (fastify) =>{

  let { rows } = await fastify.pg.query(`
    WITH winner AS (
        SELECT o.restaurant
        FROM votes v
        JOIN offers o ON v.id = o.id
        WHERE v.created_at::date = CURRENT_DATE AND o.created_at::date = CURRENT_DATE
        GROUP BY o.restaurant
        ORDER BY COUNT(*) DESC
        LIMIT 1
    )
    SELECT restaurant
    FROM winner

    UNION ALL

    SELECT NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM votes WHERE created_at::date = CURRENT_DATE
    );
  `);

  console.log(rows[0]);

  return rows[0].restaurant;
  
}

export default calculateWinner;
