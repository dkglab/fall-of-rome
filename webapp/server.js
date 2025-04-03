const express = require('express');
const app = express();
const port = 8000;

app.use(express.static('.', {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    }
  }
}));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
