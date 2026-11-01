const { chromium } = require('playwright');

async function testApp() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console logs
  page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
  page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));

  // Navigate to the app
  await page.goto('http://localhost:53943');
  await page.waitForLoadState('networkidle');

  // Check if tabs are visible
  const tabs = await page.$$('.tab-btn');
  console.log(`Found ${tabs.length} tab buttons`);

  for (const tab of tabs) {
    const text = await tab.textContent();
    const isActive = await tab.getAttribute('aria-selected');
    console.log(`Tab: ${text.trim()}, active: ${isActive}`);
  }

  // Check All Notes count
  const allNotesCount = await page.$eval('.folder-item[data-folder-id="root"] .folder-count', el => el.textContent);
  console.log(`All Notes count: ${allNotesCount}`);

  // Check if folder tree has default folders
  const folders = await page.$$('.folder-item[data-folder-id]:not([data-folder-id="root"])');
  console.log(`Number of folders (excluding root): ${folders.length}`);

  for (const folder of folders) {
    const name = await folder.$eval('.folder-name', el => el.textContent);
    const count = await folder.$eval('.folder-count', el => el.textContent);
    console.log(`Folder: ${name}, count: ${count}`);
  }

  // Test creating a new folder
  console.log('\n--- Testing new folder creation ---');
  await page.click('#new-folder-btn');
  await page.waitForSelector('#modal-overlay:not([hidden])');
  await page.fill('#prompt-input', 'Test Folder');
  await page.click('button[data-result="ok"]');
  await page.waitForFunction(() => document.getElementById('modal-overlay').hidden === true, { timeout: 5000 });

  // Wait for loadData to complete and check folder tree
  await page.waitForTimeout(1000);

  const newFolders = await page.$$('.folder-item[data-folder-id]:not([data-folder-id="root"])');
  console.log(`Number of folders after creation: ${newFolders.length}`);

  for (const folder of newFolders) {
    const name = await folder.$eval('.folder-name', el => el.textContent);
    const count = await folder.$eval('.folder-count', el => el.textContent);
    console.log(`Folder: ${name}, count: ${count}`);
  }

  // Check All Notes count again
  const newAllNotesCount = await page.$eval('.folder-item[data-folder-id="root"] .folder-count', el => el.textContent);
  console.log(`All Notes count after folder creation: ${newAllNotesCount}`);

  // Test creating a note
  console.log('\n--- Testing note creation ---');
  await page.click('#new-note-btn');
  await page.waitForSelector('#editor-view:not([hidden])');
  await page.fill('#note-title', 'Test Note');
  await page.fill('#note-content', 'This is a test note content.');
  await page.click('#save-note-btn');
  await page.waitForFunction(() => document.getElementById('modal-overlay').hidden === true, { timeout: 5000 });
  await page.waitForTimeout(500);

  // Go back to notes view
  await page.click('#back-btn');
  await page.waitForSelector('#notes-view:not([hidden])');
  await page.waitForTimeout(500);

  // Check All Notes count
  const countAfterNote = await page.$eval('.folder-item[data-folder-id="root"] .folder-count', el => el.textContent);
  console.log(`All Notes count after note creation: ${countAfterNote}`);

  // Check if note appears in grid
  const notes = await page.$$('.note-card');
  console.log(`Number of note cards: ${notes.length}`);

  for (const note of notes) {
    const title = await note.$eval('.note-title', el => el.textContent);
    console.log(`Note: ${title}`);
  }

  // Test duplicate note
  if (notes.length > 0) {
    console.log('\n--- Testing note duplication ---');
    // Use evaluate to click the duplicate button directly (bypass hover requirement)
    await page.evaluate(() => {
      const btn = document.querySelector('.note-card button[data-action="duplicate"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(1000);

    const countAfterDuplicate = await page.$eval('.folder-item[data-folder-id="root"] .folder-count', el => el.textContent);
    console.log(`All Notes count after duplicate: ${countAfterDuplicate}`);
  }

  // Test delete note
  const notesAfterDup = await page.$$('.note-card');
  if (notesAfterDup.length > 0) {
    console.log('\n--- Testing note deletion ---');
    // Use evaluate to click the delete button directly
    await page.evaluate(() => {
      const btn = document.querySelector('.note-card button[data-action="delete"]');
      if (btn) btn.click();
    });
    await page.waitForSelector('#modal-overlay:not([hidden])');
    await page.click('button[data-result="confirm"]');
    await page.waitForFunction(() => document.getElementById('modal-overlay').hidden === true, { timeout: 5000 });
    await page.waitForTimeout(1000);

    const countAfterDelete = await page.$eval('.folder-item[data-folder-id="root"] .folder-count', el => el.textContent);
    console.log(`All Notes count after delete: ${countAfterDelete}`);
  }

  // Test CLI tab
  console.log('\n--- Testing CLI tab ---');
  await page.click('.tab-btn[data-view="cli"]');
  await page.waitForSelector('#cli-view:not([hidden])');
  await page.waitForTimeout(500);

  const cliTabs = await page.$$('.tab-btn');
  for (const tab of cliTabs) {
    const text = await tab.textContent();
    const isActive = await tab.getAttribute('aria-selected');
    console.log(`Tab: ${text.trim()}, active: ${isActive}`);
  }

  // Check CLI empty state size
  const cliEmpty = await page.$('#cli-empty');
  if (cliEmpty) {
    const isHidden = await cliEmpty.getAttribute('hidden');
    console.log(`CLI empty state hidden: ${isHidden !== null}`);

    if (isHidden === null) {
      const style = await cliEmpty.evaluate(el => window.getComputedStyle(el));
      console.log(`CLI empty state padding: ${style.padding}`);
    }
  }

  // Test Settings tab
  console.log('\n--- Testing Settings tab ---');
  await page.click('.tab-btn[data-view="settings"]');
  await page.waitForSelector('#settings-view:not([hidden])');
  await page.waitForTimeout(500);

  // Test documents folder picker
  const openDocsBtn = await page.$('#open-documents-btn');
  if (openDocsBtn) {
    console.log('Open Documents button found');
  }

  // Test Import/Export buttons in sidebar
  const importBtn = await page.$('#import-btn');
  const exportBtn = await page.$('#export-btn');
  console.log(`Import btn: ${importBtn ? 'found' : 'not found'}`);
  console.log(`Export btn: ${exportBtn ? 'found' : 'not found'}`);

  // Test resize handles
  const sidebarHandle = await page.$('.resize-handle-sidebar');
  const detailHandle = await page.$('.resize-handle-detail');
  console.log(`Sidebar resize handle: ${sidebarHandle ? 'found' : 'not found'}`);
  console.log(`Detail resize handle: ${detailHandle ? 'found' : 'not found'}`);

  // Test detail sidebar close button
  await page.click('.tab-btn[data-view="notes"]');
  await page.waitForSelector('#notes-view:not([hidden])');
  await page.waitForTimeout(500);

  // Click a CLI command to open detail sidebar
  await page.click('.tab-btn[data-view="cli"]');
  await page.waitForSelector('#cli-view:not([hidden])');
  await page.waitForTimeout(500);

  const cliCards = await page.$$('.cli-command-card');
  if (cliCards.length > 0) {
    await cliCards[0].click();
    await page.waitForTimeout(500);

    const detailSidebar = await page.$('#detail-sidebar');
    const isHidden = await detailSidebar.getAttribute('hidden');
    console.log(`Detail sidebar hidden after click: ${isHidden !== null}`);

    // Check close button
    const closeBtn = await page.$('#close-detail');
    if (closeBtn) {
      console.log('Close detail button found');
      await closeBtn.click();
      await page.waitForTimeout(500);

      const isHiddenAfterClose = await detailSidebar.getAttribute('hidden');
      console.log(`Detail sidebar hidden after close: ${isHiddenAfterClose !== null}`);
    }

    // Re-open detail sidebar for copy/edit/delete tests
    await cliCards[0].click();
    await page.waitForTimeout(500);

    // Test detail sidebar copy button
    const copyBtn = await page.$('#detail-content button[data-action="copy"]');
    if (copyBtn) {
      console.log('Detail sidebar copy button found');
      // Check it doesn't close the sidebar
      await copyBtn.click();
      await page.waitForTimeout(500);
      const isHiddenAfterCopy = await detailSidebar.getAttribute('hidden');
      console.log(`Detail sidebar hidden after copy: ${isHiddenAfterCopy !== null} (should be false)`);
    }

    // Test detail sidebar edit button
    const editBtn = await page.$('#detail-content button[data-action="edit"]');
    if (editBtn) {
      console.log('Detail sidebar edit button found');
      // Click edit - should open modal and close sidebar
      await editBtn.click();
      await page.waitForTimeout(500);
      const isHiddenAfterEdit = await detailSidebar.getAttribute('hidden');
      console.log(`Detail sidebar hidden after edit: ${isHiddenAfterEdit !== null} (should be true)`);
      // Close modal if open
      await page.click('button[data-result="cancel"]');
      await page.waitForTimeout(500);
    }

    // Re-open for delete test
    await cliCards[0].click();
    await page.waitForTimeout(500);

    // Test detail sidebar delete button
    const deleteBtn = await page.$('#detail-content button[data-action="delete"]');
    if (deleteBtn) {
      console.log('Detail sidebar delete button found');
      await deleteBtn.click();
      await page.waitForSelector('#modal-overlay:not([hidden])');
      await page.click('button[data-result="confirm"]');
      await page.waitForFunction(() => document.getElementById('modal-overlay').hidden === true, { timeout: 5000 });
      await page.waitForTimeout(500);
      const isHiddenAfterDelete = await detailSidebar.getAttribute('hidden');
      console.log(`Detail sidebar hidden after delete: ${isHiddenAfterDelete !== null} (should be true)`);
    }
  }

  await browser.close();
  console.log('\n--- All tests completed ---');
}

testApp().catch(console.error);