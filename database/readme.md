# MySQL Setup Guide

## Environment Configuration

Create a `.env` file in the project root with the following variables:

```dotenv
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_DATABASE=qa_platform
MYSQL_USER=Praxis
MYSQL_PASSWORD=your_praxis_password
```

> Make sure to replace the placeholders with your actual passwords.

---

## Docker Setup

1. **Build the SQL image**  
   ```bash
   docker compose build
   ```

2. **Start the database**  
   ```bash
   docker compose up -d
   ```
   > The `-d` flag runs the container in the background.

3. **Stop and remove the database container**  
   ```bash
   docker compose down
   ```
   > If you wish to remove all the data please add `-v` to the command above.

---

## Notes

- The MySQL database is running on **port 3306** by default.  
  To change the port, modify the `docker-compose.yml` file.
- The container will be named **`Praxis-db`**.
- The backend should use the **`Praxis`** user to interact with the database.


Test database change
