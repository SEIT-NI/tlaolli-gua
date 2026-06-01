const puppeteer = require('puppeteer');

(async () => {
  console.log("Iniciando Chrome headless...");
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  console.log("Navegando a localhost:5173...");
  await page.goto('http://localhost:5173/');
  
  // Esperar a que los elementos del mapa carguen
  await page.waitForSelector('.interactive-path');
  
  console.log("Tomando captura inicial...");
  await page.screenshot({path: 'screenshot-before.png'});

  // Hacer clic en un departamento usando DOM
  console.log("Haciendo clic en un departamento...");
  await page.evaluate(() => {
    const paths = document.querySelectorAll('.interactive-path');
    if (paths.length > 0) {
      // Lanzar click en el primer path o en Managua (índice 10 por ejemplo)
      const target = paths[10] || paths[0]; 
      target.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    }
  });
  
  console.log("Esperando inicio de animación (200ms)...");
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({path: 'screenshot-mid1.png'});
  
  console.log("Esperando progreso de animación (400ms)...");
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({path: 'screenshot-mid2.png'});
  
  console.log("Esperando fin de animación (800ms)...");
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({path: 'screenshot-after.png'});
  
  await browser.close();
  console.log("Terminado!");
})();
