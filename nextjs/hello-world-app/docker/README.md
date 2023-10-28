# Docker-ize nextjs production mode
1. Add docker/Dockerfile for multistage and NODE_ENV production
2. Add .dockerignore
3. Add next.config.js for standalone mode
4. From GitHub project root directory "engineering-blog-github-actions", run command
   `docker buildx build -f nextjs/hello-world-app/docker/Dockerfile -t nextjs-hello-world:latest nextjs/hello-world-app`
5. docker run -p 3000:3000 nextjs-hello-world:latest

Optional Docker Compose
1. Add docker/docker-compose.yml
2. cd nextjs/hello-world-app/docker
3. docker compose up