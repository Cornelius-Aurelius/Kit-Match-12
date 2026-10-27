from playwright.sync_api import sync_playwright
from pathlib import Path
p=Path(__file__).parents[1]
html=(p/'index.html').read_text().replace('<link rel="stylesheet" href="styles.css">','<style>'+(p/'styles.css').read_text()+'</style>').replace('<script src="core.js" defer></script>','').replace('<script src="app.js" defer></script>','')
html=html.replace('</body>','<script>'+(p/'core.js').read_text()+'</script><script>'+(p/'app.js').read_text()+'</script></body>')
with sync_playwright() as play:
 browser=play.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [280,320,375,430,768,1024,1440]:
  page=browser.new_page(viewport={'width':width,'height':800},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded')
  page.wait_for_timeout(60)
  overflow=page.evaluate('document.documentElement.scrollWidth > innerWidth')
  print('Viewport',width,'overflow:',overflow,'errors:',errors,flush=True)
  assert not overflow and not errors
  if width in (375,1440):page.screenshot(path=str(p/f'tests/screen_{width}.png'),full_page=False,timeout=5000)
  page.close()
 page=browser.new_page(viewport={'width':375,'height':800})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 page.locator('#practiceBtn').click()
 assert page.locator('.player-card').count()==3
 for stage in range(1,31):
  page.evaluate("document.querySelector('[data-choice=\"match\"]').click()")
  page.wait_for_timeout(1020)
  if stage<30: assert page.locator('#stageText').inner_text().startswith(str(stage+1))
  if stage%10==0:print('Completed',stage,'stages',flush=True)
 assert 'FULL TIME' in page.locator('#modalTitle').inner_text()
 page.locator('#modalPrimary').click()
 assert page.locator('#stageText').inner_text().startswith('1 / 30')
 page.locator('#pauseBtn').click();assert page.locator('#modalTitle').inner_text()=='HALF-TIME BREAK'
 page.locator('#modalPrimary').click();assert page.locator('#modal').is_hidden()
 page.locator('#themeBtn').click();assert page.locator('html').get_attribute('data-theme')=='sunset'
 page.locator('#hintBtn').click();assert 'SCOUTING TIP' in page.locator('#message').inner_text()
 assert not errors,errors
 print('Full 30-stage playthrough and interactions: PASS',flush=True)
 browser.close()