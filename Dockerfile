# Keep this tag in lockstep with the exact @playwright/test version in
# package.json -- the image ships matching pre-installed browsers.
FROM mcr.microsoft.com/playwright:v1.61.1-noble

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["npx", "playwright", "test"]
