# Node.js API Image Processing with JWT Authentication

This is a simple Node.js API server that process image using JSON Web Tokens (JWT) for authentication. The server is built using the famous `Sharp` library and [Nodejs-API-Authentication](https://github.com/dangkhoa2016/Nodejs-API-Authentication).

## Features

- **Process Image:**
  - Apply any `Sharp` image processing operation to an image.

## Technologies Used

- **Sharp**: High-performance image processing library for Node.js ([link](https://sharp.pixelplumbing.com/)).
- **qs**: Library for parsing query strings in URLs ([link](https://www.npmjs.com/package/qs)).
- **Nodejs-API-Authentication**: A simple Node.js API server with JWT authentication ([link](https://github.com/dangkhoa2016/Nodejs-API-Authentication)).

## Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

2. Install dependencies:
    ```bash
    npm install or yarn install
    ```

3. Set up the SQLite database:
    - The application will automatically create a database file (`database.sqlite`) in the project root directory when the server starts. You can configure your database connection settings in the `config/database.js` file if needed.

4. Create a `.env` file at the root of your project for environment variables:
    ```env
    JWT_SECRET=<your_jwt_secret_key>
    PORT=3000
    ```

## API Endpoints

You must include the JWT token in the `Authorization` header for all requests. The token is generated when you log in to the server.

### 1. **POST /image**
- Process an image using `Sharp` and return the processed image.
- **Body**:
    ```json
    {
      "url": "https://example.com/image.jpg",
      "format": "png",
      "background": "#ff0000",
      "resize": {
        "width": 300,
        "height": 300,
        "fit": "contain",
      },
    }
    ```
- **Response**:
    ```image
    <processed_image>
    ```

### 2. **GET /image**
- Process an image using `Sharp` and return the processed image.
- **Body**:
    ```
    {
    }
    ```
  **Query**:
    ```
    "url=https://example.com/image.jpg&format=png&background=#ff0000&resize[width]=300&resize[height]=300&resize[fit]=contain"
    ```
- **Response**:
    ```image
    <processed_image>
    ```

## Logging and Debugging


The server uses **winston** for logging and **debug** with **@colors/colors** for debugging. You can enable debug logs by setting the environment variable `DEBUG=*` and specifying a log level for `winston`.

## Example Usage

1. Register a user:
    ```bash
    curl -X POST http://localhost:4000/users/register -H "Content-Type: application/json" -d '{"email": "user@example.com", "password": "password123", "username": "user123"}'
    ```

2. Log in to get the JWT token:
    ```bash
    curl -X POST http://localhost:4000/users/login -H "Content-Type: application/json" -d '{"username": "user123", "password": "password123"}'
    ```

3. Process an image:
    ```bash
    curl -X GET http://localhost:4000/image?url=https://[....].png&toFormat=jpg&resize%5Bwidth%5D=300' -H "Authorization: Bearer <jwt_token>"
    ```

for more information, please check the [image.sh](./manual/image.sh) file.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
