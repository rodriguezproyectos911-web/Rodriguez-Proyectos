const { test, expect } = require('@playwright/test');

// TODAS las solicitudes al backend real se interceptan: los tests JAMÁS generan leads ni visitas reales.
async function mockBackend(page, failForm=false) {
  await page.route('https://script.google.com/**', async route => {
    const data=route.request().postData() || '';
    const isVisit = data.includes('event=visit');
    if (failForm && !isVisit) return route.abort('failed');
    return route.fulfill({status:200,contentType:'text/plain',body:'OK'});
  });
}

test('respuesta opaca no declara recepción confirmada y preserva los campos', async ({page}) => {
  await mockBackend(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.locator('#leadForm input[name=nombre]').fill('Ana QA');
  await page.locator('#leadForm input[name=email]').fill('ana@example.test');
  await page.locator('#leadForm input[name=telefono]').fill('00123456789');
  await page.locator('#leadForm button[type=submit]').click();
  await expect(page.locator('#leadFormStatus')).toContainText('no puede confirmar automáticamente');
  await expect(page.locator('#leadForm input[name=nombre]')).toHaveValue('Ana QA');
  await expect(page.locator('#leadForm input[name=telefono]')).toHaveValue('00123456789');
  await expect(page.locator('#leadForm button[type=submit]')).toBeDisabled();
  await page.locator('#leadForm input[name=nombre]').fill('Ana QA corregida');
  await expect(page.locator('#leadForm button[type=submit]')).toBeEnabled();
});

test('fallo de red ofrece mailto optativo y no borra la consulta', async ({page}) => {
  await mockBackend(page, true);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.locator('#leadForm input[name=nombre]').fill('Ana QA');
  await page.locator('#leadForm input[name=email]').fill('ana@example.test');
  await page.locator('#leadForm button[type=submit]').click();
  await expect(page.locator('#leadFormStatus')).toContainText('No se pudo completar');
  await expect(page.locator('#leadFormStatus a[href^="mailto:"]')).toBeVisible();
  await expect(page.locator('#leadForm input[name=nombre]')).toHaveValue('Ana QA');
  await expect(page.locator('#leadForm button[type=submit]')).toBeEnabled();
  expect(page.url()).toContain('127.0.0.1:4173');
});

test('el asistente exige email y transfiere datos al formulario principal', async ({page}) => {
  await mockBackend(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.locator('#assistantBtn').click();
  await page.locator('.assistant-quick button[data-q=visita]').click();
  const assistant=page.locator('#assistantVisitForm');
  await assistant.locator('input[name=nombre]').fill('Ana');
  await assistant.locator('input[name=telefono]').fill('0012345');
  await expect(assistant.locator('input[name=email]')).toHaveAttribute('required','');
  await assistant.locator('button[type=submit]').click();
  await expect(assistant).toBeVisible();
  await assistant.locator('input[name=email]').fill('ana@example.test');
  await assistant.locator('button[type=submit]').click();
  await expect(page.locator('#leadForm input[name=nombre]')).toHaveValue('Ana');
  await expect(page.locator('#leadForm input[name=telefono]')).toHaveValue('0012345');
  await expect(page.locator('#leadForm input[name=email]')).toHaveValue('ana@example.test');
});

test('el aviso del formulario es visible y con contraste sobre fondo claro', async ({page}) => {
  await mockBackend(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.locator('#leadForm input[name=nombre]').fill('Ana QA');
  await page.locator('#leadForm input[name=email]').fill('ana@example.test');
  await page.locator('#leadForm button[type=submit]').click();
  const el=page.locator('#leadFormStatus');
  await expect(el).toBeVisible();
  expect(await el.evaluate(node=>getComputedStyle(node).color)).toBe('rgb(23, 39, 54)');
  expect(await el.evaluate(node=>getComputedStyle(node).backgroundColor)).toBe('rgb(238, 244, 249)');
});

test('ancho de 375 px: formulario y asistente permanecen navegables', async ({page}) => {
  await page.setViewportSize({width:375,height:812});
  await mockBackend(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#leadForm input[name=email]')).toBeVisible();
  await page.locator('#assistantBtn').click();
  await expect(page.locator('#assistantPanel')).toBeVisible();
  const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(size.scroll).toBeLessThanOrEqual(size.client+1);
});
