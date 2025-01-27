# 1 - login using admin credentials
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  http://localhost:4000/users/sign_in | jq
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImV4cCI6MTczODA2MTk5MSwianRpIjoiMS4xNzM4MDU4MzkxIn0.RgSnglRV_9ARYq5XE5oXIqPf_Ge0yLUQT7hjk5VjNl8",
  "user": {
    "id": 1,
    "email": "admin@localhost.test",
    "username": "admin",
    "first_name": "",
    "last_name": "",
    "avatar": null,
    "role": "admin",
    "confirmed_at": null,
    "created_at": "2025-01-27T11:18:24.422Z",
    "updated_at": "2025-01-28T09:59:51.845Z"
  }
}

# 2 - process image
curl "http://localhost:4000/image?url=https://[....].png&toFormat=jpg&resize%5Bwidth%5D=300" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImV4cCI6MTczODA2MTk5MSwianRpIjoiMS4xNzM4MDU4MzkxIn0.RgSnglRV_9ARYq5XE5oXIqPf_Ge0yLUQT7hjk5VjNl8" \
  -i

# browser fetch
fetch("/image/?url=https://[....].png&format=jpg&sharpen%5Bsigma%5D=0.5&sharpen%5Bx1%5D=0.8")

fetch("/image?url=https://[....].png&toFormat=jpg&resize%5Bwidth%5D=300&resize%5Bheight%5D=300&resize%5Bfit%5D=contain&rotate%5B0%5D=120&rotate%5B1%5D%5Bbackground%5D=%23ff0000")

# get request
fetch("/image?url=https://[....].png&toFormat=jpg&resize%5Bwidth%5D=300&resize%5Bheight%5D=300&resize%5Bfit%5D=contain&rotate%5B0%5D=120")
# post request
fetch("/image", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://[....].png",
    toFormat: "jpg",
    resize: {
      width: 300,
      height: 300,
      fit: "contain",
    },
    rotate: 120,
  }),
})

fetch("/image?url=https://[....].png&toFormat=jpg&resize%5Bwidth%5D=300&resize%5Bheight%5D=300&resize%5Bfit%5D=contain&")

# quality 100 percent
# get request
fetch("/image?url=https://[....].png&toFormat%5B0%5D=jpeg&toFormat%5B1%5D%5Bquality%5D=100&resize%5Bwidth%5D=300&resize%5Bheight%5D=300&resize%5Bfit%5D=contain&bg=orange")
# post request
fetch("/image?url=https://[....].png", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    toFormat: [
      {
        format: "jpeg",
        quality: 100,
      },
    ],
    resize: {
      width: 300,
      height: 300,
      fit: "contain",
    },
    bg: "orange",
  }),
})

# quality 80 percent
# get request
fetch("/image?url=https://[....].png&toFormat=jpeg&resize%5Bwidth%5D=300&resize%5Bheight%5D=300&resize%5Bfit%5D=contain&bg=orange")
# post request
fetch("/image?url=https://[....].png", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    toFormat: "jpeg",
    resize: {
      width: 300,
      height: 300,
      fit: "contain",
    },
    bg: "orange",
  }),
})

