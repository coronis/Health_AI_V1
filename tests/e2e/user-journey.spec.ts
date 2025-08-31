import { test, expect } from '@playwright/test';

test.describe('HealthCoachAI E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up authentication if needed
    await page.goto('http://localhost:8080');
  });

  test('User onboarding flow', async ({ page }) => {
    // Test complete user registration and onboarding
    await test.step('Navigate to registration', async () => {
      await page.click('[data-testid="register-button"]');
      await expect(page).toHaveURL(/.*\/register/);
    });

    await test.step('Fill registration form', async () => {
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123!');
      await page.click('[data-testid="submit-button"]');
    });

    await test.step('Complete profile setup', async () => {
      await expect(page).toHaveURL(/.*\/onboarding/);
      
      // Fill basic info
      await page.fill('[data-testid="first-name"]', 'John');
      await page.fill('[data-testid="last-name"]', 'Doe');
      await page.selectOption('[data-testid="gender"]', 'male');
      await page.fill('[data-testid="date-of-birth"]', '1990-01-01');
      await page.click('[data-testid="next-button"]');
      
      // Fill health info
      await page.fill('[data-testid="height"]', '175');
      await page.fill('[data-testid="weight"]', '70');
      await page.selectOption('[data-testid="activity-level"]', 'moderately_active');
      await page.click('[data-testid="next-button"]');
      
      // Set goals
      await page.check('[data-testid="goal-weight-loss"]');
      await page.check('[data-testid="goal-improved-health"]');
      await page.click('[data-testid="complete-button"]');
    });

    await test.step('Verify dashboard access', async () => {
      await expect(page).toHaveURL(/.*\/dashboard/);
      await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome, John');
    });
  });

  test('Meal planning workflow', async ({ page }) => {
    // Assume user is logged in
    await page.goto('http://localhost:8080/dashboard');
    
    await test.step('Navigate to meal planning', async () => {
      await page.click('[data-testid="meal-plan-button"]');
      await expect(page).toHaveURL(/.*\/meal-plan/);
    });

    await test.step('Generate meal plan', async () => {
      await page.selectOption('[data-testid="plan-duration"]', '7');
      await page.check('[data-testid="dietary-vegetarian"]');
      await page.click('[data-testid="generate-plan-button"]');
      
      // Wait for AI generation
      await expect(page.locator('[data-testid="meal-plan-loading"]')).toBeVisible();
      await expect(page.locator('[data-testid="meal-plan-result"]')).toBeVisible({ timeout: 30000 });
    });

    await test.step('Review and save meal plan', async () => {
      await expect(page.locator('[data-testid="meal-day-1"]')).toBeVisible();
      await page.click('[data-testid="save-plan-button"]');
      await expect(page.locator('[data-testid="plan-saved-message"]')).toBeVisible();
    });
  });

  test('Food logging with AI assistance', async ({ page }) => {
    await page.goto('http://localhost:8080/food-log');
    
    await test.step('Add food item', async () => {
      await page.click('[data-testid="add-food-button"]');
      await page.fill('[data-testid="food-search"]', 'chicken curry');
      await page.click('[data-testid="search-button"]');
    });

    await test.step('Select food and portion', async () => {
      await page.click('[data-testid="food-item-0"]');
      await page.fill('[data-testid="portion-size"]', '200');
      await page.selectOption('[data-testid="portion-unit"]', 'g');
      await page.click('[data-testid="add-to-log-button"]');
    });

    await test.step('Verify nutrition calculation', async () => {
      await expect(page.locator('[data-testid="daily-calories"]')).toContainText(/\d+/);
      await expect(page.locator('[data-testid="daily-protein"]')).toContainText(/\d+/);
    });
  });

  test('AI chat interaction', async ({ page }) => {
    await page.goto('http://localhost:8080/chat');
    
    await test.step('Send health query', async () => {
      await page.fill('[data-testid="chat-input"]', 'What should I eat for breakfast to lose weight?');
      await page.click('[data-testid="send-button"]');
    });

    await test.step('Verify AI response', async () => {
      await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
      await expect(page.locator('[data-testid="ai-response"]')).toContainText(/breakfast/i);
    });

    await test.step('Follow up question', async () => {
      await page.fill('[data-testid="chat-input"]', 'Can you suggest a specific recipe?');
      await page.click('[data-testid="send-button"]');
      await expect(page.locator('[data-testid="ai-response"]:last-child')).toBeVisible({ timeout: 15000 });
    });
  });

  test('Performance monitoring', async ({ page }) => {
    // Test that pages load within acceptable time limits
    const startTime = Date.now();
    await page.goto('http://localhost:8080/dashboard');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // Page should load in under 3 seconds
  });

  test('Accessibility compliance', async ({ page }) => {
    await page.goto('http://localhost:8080/dashboard');
    
    // Check for basic accessibility features
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[role="main"]')).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });
});