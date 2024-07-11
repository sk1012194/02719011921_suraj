require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 9876;

// In-memory storage for numbers
let numbers = [];
const windowSize = 10;

// Bearer token for authentication
const bearerToken = process.env.BEARER_TOKEN;

// Utility functions
const isValidID = (id) => ["p", "f", "e", "r"].includes(id);

const getApiEndpoint = (id) => {
  switch (id) {
    case "p":
      return "http://20.244.56.144/test/primes";
    case "f":
      return "http://20.244.56.144/test/fibo";
    case "e":
      return "http://20.244.56.144/test/even";
    case "r":
      return "http://20.244.56.144/test/random";
    default:
      return "";
  }
};

// Fetch numbers from third-party API
const fetchNumbers = async (id) => {
  try {
    const endpoint = getApiEndpoint(id);
    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      timeout: 500,
    });
    return response.data.numbers;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const calculateAverage = (nums) => {
  if (nums.length === 0) return 0;
  const sum = nums.reduce((acc, num) => acc + num, 0);
  return sum / nums.length;
};

// Route to handle the number ID requests
app.get("/numbers/:numberid", async (req, res) => {
  const { numberid } = req.params;

  if (!isValidID(numberid)) {
    return res.status(400).json({ error: "Invalid number ID" });
  }

  const fetchedNumbers = await fetchNumbers(numberid);

  if (fetchedNumbers.length > 0) {
    fetchedNumbers.forEach((num) => {
      if (!numbers.includes(num)) {
        numbers.push(num);
        if (numbers.length > windowSize) {
          numbers.shift();
        }
      }
    });
  }

  const avg = calculateAverage(numbers);

  res.json({
    windowPrevState: numbers.slice(0, -fetchedNumbers.length),
    windowCurrState: numbers,
    numbers: fetchedNumbers,
    avg: avg.toFixed(2),
  });
});

app.listen(port, () => {
  console.log(
    `Average Calculator microservice running on http://localhost:${port}`
  );
});
