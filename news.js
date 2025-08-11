// Example: serverless function to fetch market news
export default async function handler(req, res) {
  try {
    const response = await fetch("https://newsapi.org/v2/top-headlines?category=business&apiKey=YOUR_NEWSAPI_KEY");
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
