
## Authentication API

### 1. **Register User**

- **URL**  
  /auth/signup
  
- **Method**  
  POST
  
- **Request Body**  
  ```json
  {
    "name": "string",
    "email": "string", // Must be unique
    "password": "string"
  }
  ```

- **Response**  
  ```json
  {
    "message": "Successfully registered"
  }
  ```

---

### 2. **Login User**

- **URL**  
  /auth/login
  
- **Method**  
  POST
  
- **Request Body**  
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

- **Response**  
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJsaWNfaWQiOiI0MmI1ZjhhNy04NWIwLTQ0MTctODM1ZC0xMDM4ZGZjODhlN2QiLCJleHAiOjE3MzI3MDgxNjh9.swzCrLGK0aBWfU0Ljn01nU9Z4a5isIQha1OGnb-yGAM"
  }
  ```

---

### 3. **Get Authenticated Profile**

- **URL**  
  /auth/profile
  
- **Method**  
  GET
  
- **Headers**  
  - x-access-token: string (Required for authentication)

- **Response**  
  ```json
  {
    "users": [
      {
        "email": "johndoe@example.com",
        "name": "John Doe",
        "public_id": "35096c72-f531-47ad-9d4c-6b385d0c4f65"
      }
    ]
  }
  ```

  ### 4. **Get Authenticated Profile**

- **URL**  
  /process-image
  
- **Method**  
  POST
  
- **Body**  
  - image: contoh.png

- **Response**  
  ```json
  {
            "function": "Plant extract for which there is a small amount of research showing it has skin soothing and antioxidant properties.",
            "name": "tricolor",
            "predicted_rating": "AVERAGE"
        },
        {
            "function": "Scutellaria baicalensis root extract comes from a flowering plant native to China.",
            "name": "scutellaria",
            "predicted_rating": "GOOD"
        },
    "predicted_skincare_categories": [
        "For Mature Skin",
        "For Sensitive Skin"
    ]
  }
  
  ```

