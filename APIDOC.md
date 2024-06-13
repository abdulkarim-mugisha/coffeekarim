# API Documentation

## Signup Endpoint
### POST /signup
Creates a new user account.

#### Request Body
- `name` (string): The name of the user.
- `email` (string): The email of the user.
- `password` (string): The password of the user.

#### Responses
- `201 Created`: User account created successfully.
 - `message` (string): "User created"
 - `user` (object): `{ email: <user_email> }`
- `400 Bad Request`: User already exists.
 - `message` (string): "User already exists"
- `500 Internal Server Error`: Error in creating user account.

## Login Endpoint
### POST /login
Logs in a user.

#### Request Body
- `email` (string): The email of the user.
- `password` (string): The password of the user.

#### Responses
- `200 OK`: User logged in successfully.
 - `message` (string): "Logged in"
 - `user` (object): `{ email: <user_email> }`
- `401 Unauthorized`: Invalid credentials.
 - `message` (string): "Invalid credentials"
- `500 Internal Server Error`: Error in logging in.

## Logout Endpoint
### POST /logout
Logs out the current user.

#### Responses
- `200 OK`: User logged out successfully.
 - `message` (string): "Logged out"

## Get Data Endpoint
### GET /data
Retrieves data from the server.

#### Responses
- `200 OK`: Data retrieved successfully.
 - `data` (array): Array of data objects.
- `500 Internal Server Error`: Error in fetching data.

## Get Cart Endpoint
### GET /cart
Retrieves cart data from the server.

#### Responses
- `200 OK`: Cart data retrieved successfully.
 - `data` (array): Array of cart items.
- `500 Internal Server Error`: Error in fetching data.

## Add to Cart Endpoint
### POST /addToCart
Adds an item to the cart.

#### Request Body
- `data` (object): The item to be added to the cart.

#### Responses
- `200 OK`: Item added to cart successfully.
 - `message` (string): "Item has been added to cart!"
- `500 Internal Server Error`: Error in adding data to cart.

## Contact Endpoint
### POST /contact
Submits contact information.

#### Request Body
- `name` (string): The name of the user.
- `email` (string): The email of the user.
- `message` (string): The message from the user.

#### Responses
- `201 Created`: Contact information submitted successfully.
 - `message` (string): "Your information has been sent!"
- `400 Bad Request`: Missing required fields.
 - `message` (string): "Please provide name, email, and message."
- `500 Internal Server Error`: Error in submitting contact information.

## Remove from Cart Endpoint
### POST /removeCart
Removes an item from the cart.

#### Request Body
- `name` (string): The name of the item to be removed.
- `price` (number): The price of the item to be removed.
- `amount` (number): The amount of the item to be removed.

#### Responses
- `200 OK`: Item removed from cart successfully.
 - `message` (string): "Item has been removed from cart!"
- `400 Bad Request`: Missing required fields.
 - `message` (string): "Did not pass in product information."
- `500 Internal Server Error`: Error in fetching data.