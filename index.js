
const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, Op } = require('sequelize');
const defineContact = require('./models/contact');


const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));


//db connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'bitespeed.sqlite',
  logging: false,
});
const Contact = defineContact(sequelize);

(async () => {
  await sequelize.sync();
})();




// Serve the HTML UI as the homepage and at /identify (GET)
const path = require('path');
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/identify', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


//identity endpoint
app.post('/identify', async (req, res) => {
  const { email, phoneNumber } = req.body;
  if (!email && !phoneNumber) return res.status(400).json({ error: 'email or phoneNumber required' });

  const contacts = await Contact.findAll({
    where: {
      [Op.or]: [
        email ? { email } : null,
        phoneNumber ? { phoneNumber } : null,
      ].filter(Boolean),
    },
    order: [['createdAt', 'ASC']],
  });

  let primaryContact = null;
  let allContacts = [];

  if (contacts.length === 0) {
    primaryContact = await Contact.create({
      email,
      phoneNumber,
      linkPrecedence: 'primary',
    });
    allContacts = [primaryContact];
  } else {
    let relatedContacts = [...contacts];
    let seenIds = new Set(relatedContacts.map(c => c.id));
    let queue = [...relatedContacts];
    while (queue.length) {
      const current = queue.shift();
      // Find all contacts that are linked by email, phone, or linkedId (both ways)
      const found = await Contact.findAll({
        where: {
          [Op.or]: [
            current.email ? { email: current.email } : null,
            current.phoneNumber ? { phoneNumber: current.phoneNumber } : null,
            { linkedId: current.id },
            current.linkedId ? { id: current.linkedId } : null
          ].filter(Boolean),
        },
      });
      for (const c of found) {
        if (!seenIds.has(c.id)) {
          seenIds.add(c.id);
          relatedContacts.push(c);
          queue.push(c);
        }
      }
    }
    allContacts = relatedContacts;

    primaryContact = allContacts.find(c => c.linkPrecedence === 'primary') ||
                     allContacts.reduce((a, b) => a.createdAt < b.createdAt ? a : b);

    const hasEmail = allContacts.some(c => c.email === email);
    const hasPhone = allContacts.some(c => c.phoneNumber === phoneNumber);
    if ((email && !hasEmail) || (phoneNumber && !hasPhone)) {
      const newContact = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: 'secondary',
        linkedId: primaryContact.id,
      });
      allContacts.push(newContact);
    }

    const primaries = allContacts.filter(c => c.linkPrecedence === 'primary');
    if (primaries.length > 1) {
      const oldest = primaries.reduce((a, b) => a.createdAt < b.createdAt ? a : b);
      await Promise.all(primaries.filter(p => p.id !== oldest.id).map(p =>
        p.update({ linkPrecedence: 'secondary', linkedId: oldest.id })
      ));
      primaryContact = oldest;
    }
  }

  const primaryId = primaryContact.id;
  const emails = [...new Set([primaryContact.email, ...allContacts.filter(c => c.email && c.id !== primaryId).map(c => c.email)])].filter(Boolean);
  const phoneNumbers = [...new Set([primaryContact.phoneNumber, ...allContacts.filter(c => c.phoneNumber && c.id !== primaryId).map(c => c.phoneNumber)])].filter(Boolean);
  const secondaryContactIds = allContacts.filter(c => c.linkPrecedence === 'secondary' && c.linkedId === primaryId).map(c => c.id);

  res.json({
    contact: {
      primaryContatctId: primaryId,
      emails,
      phoneNumbers,
      secondaryContactIds,
    }
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));