import { test, expect } from '@playwright/test';

test.describe('API Testing Examples', () => {

  test('GET request - fetch posts from JSONPlaceholder', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(body).toHaveProperty('id', 1);
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('body');
    expect(body).toHaveProperty('userId');
  });

  test('GET request - verify response headers and status', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/posts');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('POST request - create a new resource', async ({ request }) => {
    const newPost = {
      title: 'Playwright API Testing',
      body: 'This is a test post created via Playwright API',
      userId: 1,
    };

    const response = await request.post('https://jsonplaceholder.typicode.com/posts', {
      data: newPost,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('title', 'Playwright API Testing');
    expect(body).toHaveProperty('body');
    expect(body).toHaveProperty('userId', 1);
  });

  test('PUT request - update an existing resource', async ({ request }) => {
    const updatedPost = {
      id: 1,
      title: 'Updated Title',
      body: 'Updated body content',
      userId: 1,
    };

    const response = await request.put('https://jsonplaceholder.typicode.com/posts/1', {
      data: updatedPost,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('title', 'Updated Title');
  });

  test('DELETE request - remove a resource', async ({ request }) => {
    const response = await request.delete('https://jsonplaceholder.typicode.com/posts/1');

    expect(response.status()).toBe(200);
  });

  test('GET request - handle non-existent resource', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/posts/99999');

    expect(response.status()).toBe(404);
  });

  test('GET request - query parameters', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/posts', {
      params: {
        userId: 1,
        _limit: 3,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeLessThanOrEqual(3);
    body.forEach((post: { userId: number }) => {
      expect(post.userId).toBe(1);
    });
  });
});
