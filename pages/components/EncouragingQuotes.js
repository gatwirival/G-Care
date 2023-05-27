import { useEffect, useState } from 'react';

const EncouragingQuotes = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    fetch('https://api.quotable.io/random')
      .then((response) => response.json())
      .then((data) => setQuote(data.content))
      .catch((error) => console.error(error));
  }, []);

  const fetchRandomQuote = () => {
    fetch('https://api.quotable.io/random')
      .then((response) => response.json())
      .then((data) => setQuote(data.content))
      .catch((error) => console.error(error));
  };

  return (
    <div>
      <h2>Encouraging Quote of the Day:</h2>
      <blockquote>{quote}</blockquote>
      <button onClick={fetchRandomQuote}>Get Another Quote</button>
    </div>
  );
};

export default EncouragingQuotes;
