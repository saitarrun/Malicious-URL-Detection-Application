const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('URL Checker Service is running!');
});

app.post('/predict', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Dummy prediction logic
  const isMalicious = Math.random() > 0.5;

  res.json({
    url,
    is_malicious: isMalicious,
    confidence: Math.random(),
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});