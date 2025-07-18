
# Bitespeed Identity Reconciliation Backend Task

This project implements the Bitespeed identity reconciliation backend task for FluxKart.com. It links customer contacts across multiple purchases using email and phone number, ensuring a unified customer experience.

**Author:** Nayan Mandal  
**Edu Email:** bt22csd035@iiitn.ac.in  
**Personal Email:** nayan.iiitn@gmail.com

## Features
- Exposes a `/identify` POST endpoint to reconcile customer identities
- Uses Node.js, Express, Sequelize, and SQLite (can be switched to any SQL DB)
- Follows all assignment requirements for linking, merging, and response format

## Getting Started

### 1. Clone the repository
```sh
git clone https://github.com/9keystrokes/Identity-Reconciliation.git
cd Identity-Reconciliation
```

### 2. Install dependencies
```sh
npm install
```

### 3. Start the server
```sh
node index.js
```


### 4. Test the endpoint
You can use Postman to test the API:

#### Example request in Postman:
1. Set the method to `POST` and the URL to `https://identity-reconciliation-nayan.onrender.com/identify`
2. Go to the **Body** tab, select **raw** and choose **JSON** from the dropdown.
3. Enter the following JSON:
```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
```
4. Click **Send**.

5. Again Enter the following JSON:
```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
```
6. Again Click **Send**.

7. Again Enter the following JSON:
```json
{
  "phoneNumber": "123456"
}
```
8. Again Click **Send**.

#### Example response:
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

## API Endpoint

### POST `/identify`

**Request Body:**
```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": number,
    "emails": ["string"],
    "phoneNumbers": ["string"],
    "secondaryContactIds": [number]
  }
}
```

## Project Structure

- `index.js` - Main Express app and endpoint logic
- `models/contact.js` - Sequelize Contact model
- `bitespeed.sqlite` - SQLite database (auto-created)
- `.gitignore` - Excludes node_modules, DB, logs, etc.

## Deployment

Deployed on [Render](https://identity-reconciliation-nayan.onrender.com/)

**Live Demo:**
```
https://identity-reconciliation-nayan.onrender.com/

https://identity-reconciliation-nayan.onrender.com/identify [identify endpoint]
```

## Notes
- Use JSON body for all requests (not form-data)
- The endpoint is fully compliant with the assignment requirements
- For any questions, open an issue or contact the maintainer
