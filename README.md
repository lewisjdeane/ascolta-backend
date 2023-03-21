# Ascolta

Welcome to Ascolta! This repository contains the backend code for the Ascolta website, which leverages AI to help people learn languages more effectively. 

## Features

Ascolta currently offers two key features:

1. **Live chat with a chatbot:** Users can practice their language skills with a chatbot that role plays a character with its own unique personality. The chatbot uses OpenAI's APIs for text generation, and can provide users with instant feedback on their language skills.

2. **Listening and reading comprehension exercises:** Users can practice their listening and reading skills through conversations between characters, which include audio, a transcript, and questions to test comprehension. Ascolta uses Azure's Cognitive Services SDK for Text-to-Speech generation and Azure's Storage SDK for storing generated audio and images.

## Project Structure

This repository contains all the backend logic for the Ascolta website. The project is organized into the following directories:

- `src`: This directory contains all of the backend logic for Ascolta.
  - `ai`: This directory contains the logic for AI-generation functions.
  - `audio`: This directory contains the logic for audio-generation functions.
  - `config`: This directory contains configuration files for integrations, such as environment variables.
  - `db`: This directory contains the logic for database integration.
  - `routes`: This directory contains the endpoints that are exposed on the server.
  - `scripts`: This directory contains scripts that can be run directly on the server to avoid exposing them via HTTP.
  - `storage`: This directory contains the logic for storage integration.
  - `types`: This directory contains custom types used throughout the codebase.

## Technology Stack

Ascolta is built using a variety of technologies and services, including:

- **OpenAI API:** Ascolta uses OpenAI's API for text generation, allowing the chatbot to simulate realistic conversations with users.
- **Azure Cognitive Services SDK:** Ascolta uses Azure's Cognitive Services SDK for Text-to-Speech generation, enabling the site to generate high-quality audio files for listening exercises.
- **Azure Storage SDK:** Ascolta uses Azure's Storage SDK for storing generated audio and images.
- **Azure Cosmos DB (MongoDB):** Ascolta uses Azure's Cosmos DB for persisting structured data.
- **Node.js:** Ascolta is built using Node.js, a popular JavaScript runtime for building scalable web applications.
- **Express.js:** Ascolta uses Express.js, a minimalist web framework for Node.js, to handle HTTP requests and responses.

## License

This project is licensed under the GPLv3 License - see the LICENSE file for details.
