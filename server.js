const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for demo (in production, use a database)
let items = [
  { id: 1, title: 'iPhone 12', description: 'Excellent condition iPhone 12', category: 'Electronics', owner: 'John', wantedItems: 'Laptop, Camera' },
  { id: 2, title: 'Guitar', description: 'Acoustic guitar, well maintained', category: 'Music', owner: 'Alice', wantedItems: 'Keyboard, Headphones' },
  { id: 3, title: 'Books Collection', description: '50+ programming books', category: 'Books', owner: 'Bob', wantedItems: 'Tablet, Monitor' }
];

let nextId = 4;

// Routes
app.get('/api/items', (req, res) => {
  res.json(items);
});

app.post('/api/items', (req, res) => {
  const { title, description, category, owner, wantedItems } = req.body;
  
  if (!title || !description || !owner) {
    return res.status(400).json({ error: 'Title, description, and owner are required' });
  }
  
  const newItem = {
    id: nextId++,
    title,
    description,
    category: category || 'Other',
    owner,
    wantedItems: wantedItems || ''
  };
  
  items.push(newItem);
  res.status(201).json(newItem);
});

app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  items.splice(index, 1);
  res.json({ message: 'Item deleted successfully' });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Barter System server running on http://localhost:${PORT}`);
});