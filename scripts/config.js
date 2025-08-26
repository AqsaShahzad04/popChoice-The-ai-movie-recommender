import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
const TMDB_V4_TOKEN =import.meta.env.VITE_TMDB_V4_TOKEN;
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
const genAI = new GoogleGenerativeAI(geminiKey);
export const supabase = createClient(supabaseUrl, supabaseKey);
const embeddingModel = genAI.getGenerativeModel({ model:"text-embedding-004" });
/** Gemini config */
// const model = genAI.getGenerativeModel({ model: "embedding-001" });

// export async function main(movies) {
//   const contentEmbeded = await Promise.all(movies.map(async movie => {
//     const result = await embeddingModel.embedContent({
//       content: { parts: [{ text: movie.content }] }
//     });
//     const embedding = result.embedding.values;
//     return {
//       title: movie.title,
//       release_year: movie.releaseYear,
//       embeddings: embedding,
//       description:movie.content
//     }
//   })
//   )
//   return contentEmbeded
// }
//   const { data, error } = await supabase.from('moviesdata').insert(contentEmbeded);
//   if (error) {
//     console.error(error);
//   }
//   else {
//     console.log('data inserted successfully');
//   }
 
// }

export async function main(data) {

    const result = await embeddingModel.embedContent({
      content: { parts: [{ text: data }] }
    });
    const embedding = result.embedding.values;
    return {
      embedding,
      interests:data
    }
}
 const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are a movie recommendation expert. Always respond in a friendly tone and provide detailed explanations for the title that i will provide you for the movie.respond like you are giving advice .start your answers like .... you should watch this bacause...(users interest) . Keep responses under 50 words."
});
// export async function generateUserFriendlyAnswer(dataArr){
//   const resultArray =await Promise.all(dataArr.map(async item => {
//     const result = await model.generateContent(`${item.title}....${item.release_year}`)
//     const response = result.response;
//     return {
//       desc: response.text(),
//       title:item.title
//     }
//   }))
//   return resultArray
// }



  async function getPosterByTitle(title) {
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&include_adult=false&language=en-US&page=1`;

    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_V4_TOKEN}`,
      }
    });

    if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
    const data = await res.json();

    if (!data.results?.length) return null;

    const movie = data.results[0];
    if (!movie.poster_path) return null;

    return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  }


  /**
   * Takes an array of objects with `title` property
   * and returns an array of poster URLs
   */
  export async function getPosters(dataArr) {
    const moviesDataWithPosters = await Promise.all(
      dataArr.map(async item => {
        const poster = await getPosterByTitle(item.title);
         const result = await model.generateContent(`${item.title}....${item.release_year}`)
        const response = result.response.text();
        return {
          title: item.title,
          poster: poster,
          desc:response
         }
      })
    );

    return moviesDataWithPosters;
  }
