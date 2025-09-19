# Sweet Shop App

A web app to manage and buy sweets. Admin can add/edit/delete/restock sweets. Users can view and buy sweets.

---

## Features

### Admin

- Add new sweets
- Edit sweets
- Delete sweets
- Restock sweets
- See all sweets

### User

- See sweets list
- Search by name, category, price range
- Buy sweets

---

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, PostgreSQL (Supabase)
- **Frontend:** React (Vite)
- **Auth:** JWT token-based
- **Testing:** Pytest, TDD

---

## Setup

### Backend

1. Clone repo
2. Go to backend folder
3. Install packages
   ```bash
   pip install -r requirements.txt
   ```
4. Create `.env` file (example):
   ```env
   DATABASE_URL=your_database_url
   JWT_SECRET=your_secret
    JWT_ALGORITHM=algo
    ACCESS_TOKEN_EXPIRE_MINUTES = Timeout
   ```
5. Run server
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend

1. Go to frontend folder
2. Install packages
   ```bash
   npm install
   ```
3. Create `.env` file (example):
   ```env
   VITE_BASE_API=http://127.0.0.1:8000/api
   ```
4. Run app
   ```bash
   npm run dev
   ```

---

## API Endpoints

### Auth

- `POST /api/auth/register` → register new user
- `POST /api/auth/login` → login and get token

### Sweets

- `GET /api/sweets/` → get all sweets
- `POST /api/sweets/` → add new sweet (admin)
- `PATCH /api/sweets/{id}` → edit sweet (admin)
- `DELETE /api/sweets/{id}` → delete sweet (admin)
- `POST /api/sweets/{id}/purchase` → buy sweet (user)
- `POST /api/sweets/{id}/restock?amount=` → add stock (admin)
- `GET /api/sweets/search?name=&category=&min_price=&max_price=` → search sweets

---

## Testing

- Run tests
  ```bash
  pytest --cov
  ```

---

## My AI Usage

- **ChatGPT**:

  - Wrote backend code, models, routes, and tests while i have provided the basic logic and code instructed the model using prompt which method to use and how to design.
  - Helped fix test errors.

- **Claude**:

  - Improved frontend UI and layout.
  - Made components look better and responsive.

Co-authored commits:

```
Co-authored-by: ChatGPT <AI@users.noreply.github.com>
Co-authored-by: Claude <AI@users.noreply.github.com>
```

---

## Live Links 
Backend:
```
https://sweet-shop-kata.onrender.com
```
Frontend:
```
https://sweet-shop-kata-git-main-manasaa22s-projects.vercel.app/login
```

![WhatsApp Image 2025-09-19 at 22 38 25_e1b20528](https://github.com/user-attachments/assets/1461c4d8-001f-4d57-a658-dc19cea3363a)



