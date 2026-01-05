# spotify_scrapper

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![Spotify](https://img.shields.io/badge/Spotify-1DB954?style=for-the-badge&logo=spotify&logoColor=white)

spotify scrapper with bun and stuff
auth with pkce

run index.ts -> it calls getToken() -> it handles the token in .env. if not auth yet calls startAuthServer() -> uses pkce to auth and stores the token
