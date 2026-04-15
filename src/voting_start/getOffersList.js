// import OpenAI from "openai";

// const URL = "https://rotermann.ee/tana-lounaks/";

// // Initialize DeepSeek client
// const client = new OpenAI({
//     apiKey: process.env.DEEPSEEK_API_KEY, // Replace with your actual API key
//     baseURL: "https://api.deepseek.com/v1/",
// });

// const structuredInstructions = [
//     "Parse the following page:",
//     URL,
//     `Create a lunch menu for every restaurant.
//     This is an example of HTML structure of one restaurant:
//     <div class="lunch--inner"> 
//     <div class="lunch--title lunch--block"> 
//     <a href="https://www.levier.ee/"> 
//     <h3>Levier</h3> </a> </div>
//     <div class="single-offer lunch--block">
//     <div class="columns is-marginless is-paddingless is-flex">
//     <div class="single-offer--content column is-marginless is-paddingless">
//     <p>Lihaseljanka</p> </div> <div class="single-offer--price column is-narrow is-marginless is-paddingless">
//     <p>5.9€</p> </div> </div> <div class="columns is-marginless is-paddingless is-flex"> <div class="single-offer--content column is-marginless is-paddingless"> 
//     <p>Valge kalafilee, basmati riis, karrikaste, kurgi-redise salat</p> </div> <div class="single-offer--price column is-narrow is-marginless is-paddingless"> 
//     p>8.5€</p> </div> </div> </div>
//     </div> Name of the restaurant is inside of the h3 in the div with the class 'lunch--title'. All of the lunch options from one establishment are placed inside the 'p' tags which are in the div with class 'single-offer'. Remain all of the lunch options unchanged.`,
//     "Answer should be in the format of Javascript array which consist of the other arrays, where first item is the food establishment name and the second value is one of the suggested lunches.",
//     "You should create the new item in the array for the every menu option in one food establishment.",
//     "Name of the establishment is inside of the h3 in the div with the class 'lunch--title'.",
//     "All of the lunch options from one establishment are placed inside the 'p' tags which are in the div with class 'single-offer'.",
//     "Remain all of the lunch options unchanged. Prices should stay as well.",
//     "Do not include anything in the response besides the array."
// ];

// const MODELS = [
//     "deepseek-chat", // Latest DeepSeek model (V3.2)
//     // "deepseek-reasoner", // Optional: for complex reasoning tasks
// ];

// const MAX_GLOBAL_RETRIES = 3;

// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const getOffersList = async (fastify) => {
//     const baseRequest = {
//         model: MODELS[0],
//         messages: [
//             {
//                 role: "user",
//                 content: structuredInstructions.join("\n\n"),
//             },
//         ],
//         temperature: 0.1,
//         response_format: { type: "text" },
//     };

//     for (let attempt = 1; attempt <= MAX_GLOBAL_RETRIES; attempt++) {
//         fastify.log.info(`Global attempt ${attempt}`);

//         for (const model of MODELS) {
//             fastify.log.info(`Trying model: ${model}`);
            
//             const requestBody = {
//                 ...baseRequest,
//                 model,
//             };

//             try {
//                 const result = await client.chat.completions.create(requestBody);
//                 const responseText = JSON.parse(result.choices[0].message.content);
//                 return responseText;
//             } catch (error) {
//                 fastify.log.error({ error, model }, `Model failed: ${model}`);
//             }
//         }

//         if (attempt < MAX_GLOBAL_RETRIES) {
//             fastify.log.warn("All models failed. Retrying in 3 minutes...");
//             await sleep(3 * 60 * 1000);
//         }
//     }

//     fastify.log.error("All retries exhausted.");
//     return null;
// };

// export default getOffersList;
import fetch from "node-fetch";
import * as cheerio from 'cheerio';

async function getOffersList() {
  const url = "https://rotermann.ee/tana-lounaks/";

  const response = await fetch(url);
  const html = await response.text();

  const $ = cheerio.load(html);

  const result = [];

  $(".lunch--inner").each((_, rest) => {
    const restaurantName = $(rest)
      .find(".lunch--title h3")
      .text()
      .trim();

    if (!restaurantName) return;

    $(rest)
      .find(".single-offer--content p")
      .each((_, offer) => {
        const text = $(offer).text().trim();
        if (text) {
          result.push([restaurantName, text]);
        }
      });
  });

  return result;
}

export default getOffersList;

