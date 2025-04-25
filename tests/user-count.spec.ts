import { test, expect } from '@playwright/test';

// 채널 헤더의 접속자 수 표시 및 팝오버 테스트
test('접속자 수 표시 및 팝오버 기능 테스트', async ({ page, context }) => {
  // 첫 번째 브라우저 탭에서 페이지 열기
  await page.goto('/sse');
  
  // 채팅 인터페이스가 로드될 때까지 기다림
  await page.waitForSelector('.p-4.border-b', { timeout: 10000 });
  
  // 채널 헤더에 접속자 수가 표시되는지 확인
  const userCountButton = page.getByRole('button', { name: /접속자/ });
  await expect(userCountButton).toBeVisible({ timeout: 5000 });
  
  // 접속자 수가 1이 될 때까지 기다림
  await expect(async () => {
    const text = await userCountButton.textContent();
    expect(text).toContain('1');
  }).toPass({ timeout: 5000 });
  
  // 팝오버 열기
  await userCountButton.click();
  
  // 팝오버 내용 확인
  const popoverContent = page.locator('[role="dialog"]');
  await expect(popoverContent).toBeVisible({ timeout: 5000 });
  await expect(popoverContent).toContainText('채널 접속자 목록', { timeout: 5000 });
  
  // 현재 사용자 이름 확인 (자동으로 생성되는 Guest_ 형식)
  const userNamePattern = /Guest_[0-9]+/;
  await expect(async () => {
    const content = await popoverContent.textContent();
    return userNamePattern.test(content || '');
  }).toPass({ timeout: 5000 });
  
  // 팝오버 닫기
  await page.keyboard.press('Escape');
  
  // 두 번째 브라우저 컨텍스트 열기
  const secondBrowser = await context.newPage();
  await secondBrowser.goto('/sse');
  
  // 두 번째 페이지의 채팅 인터페이스가 로드될 때까지 기다림
  await secondBrowser.waitForSelector('.p-4.border-b', { timeout: 10000 });
  
  // 첫 번째 사용자 화면에서 접속자 수가 업데이트되는지 확인 (2명이 되어야 함)
  await expect(async () => {
    const text = await userCountButton.textContent();
    expect(text).toContain('2');
  }).toPass({ timeout: 10000 });
  
  // 팝오버 다시 열기
  await userCountButton.click();
  
  // 팝오버에 두 명의 사용자가 표시되는지 확인
  await expect(async () => {
    const content = await popoverContent.textContent();
    const userCount = (content?.match(/Guest_[0-9]+/g) || []).length;
    return userCount >= 2;
  }).toPass({ timeout: 5000 });
  
  // 두 번째 브라우저 닫기
  await secondBrowser.close();
  
  // 첫 번째 사용자 화면에서 접속자 수가 다시 1로 변경되는지 확인
  await expect(async () => {
    const text = await userCountButton.textContent();
    expect(text).toContain('1');
  }).toPass({ timeout: 15000 });
});