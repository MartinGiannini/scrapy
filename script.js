document.getElementById('submit').addEventListener('click', async () => {
  const urlInput = document.getElementById('url').value.trim();
  const style = document.getElementById('style').value;
  const messageEl = document.getElementById('message');
  const resultLinkEl = document.getElementById('result-link');
  resultLinkEl.innerHTML = '';
  
  if (!urlInput) {
    messageEl.textContent = 'Por favor ingresa una URL.';
    return;
  }
  messageEl.textContent = 'Raspando y generando página...';
  
  try {
    const response = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(urlInput));
    if (!response.ok) throw new Error('Error al obtener la página.');
    let html = await response.text();
    
    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove scripts
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(s => s.remove());
    
    // Convert relative src and href attributes to absolute
    const baseUrl = new URL(urlInput);
    // images
    doc.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src');
      try {
        const abs = new URL(src, baseUrl).href;
        img.setAttribute('src', abs);
      } catch(e) {}
    });
    // link tags
    doc.querySelectorAll('link[href]').forEach(link => {
      const href = link.getAttribute('href');
      try {
        const abs = new URL(href, baseUrl).href;
        link.setAttribute('href', abs);
      } catch(e) {}
    });
    
    // Insert custom style
    const styleEl = document.createElement('style');
    styleEl.textContent = style;
    doc.head.appendChild(styleEl);
    
    // Serialize document
    const redesignedHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
    
    // Create blob
    const blob = new Blob([redesignedHtml], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    
    // Create link
    const link = document.createElement('a');
    link.href = blobUrl;
    link.target = '_blank';
    link.textContent = 'Ver página rediseñada';
    resultLinkEl.appendChild(link);
    messageEl.textContent = 'Página generada.';
  } catch (err) {
    console.error(err);
    messageEl.textContent = 'Error: ' + err.message;
  }
});
