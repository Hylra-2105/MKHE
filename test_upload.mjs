import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function test() {
  const form = new FormData();
  // Create a dummy image file
  fs.writeFileSync('test.webp', 'dummy content');
  form.append('images', fs.createReadStream('test.webp'), {
    filename: 'test.webp',
    contentType: 'image/webp'
  });

  try {
    // The id in the screenshot is 6a1ce20e5a8991bc62425d76
    const res = await fetch('http://localhost:5000/api/products/6a1ce20e5a8991bc62425d76/upload-gallery', {
      method: 'POST',
      body: form,
      headers: {
        // Mock authorization if needed, but wait, the endpoint has verifyToken!
      }
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch(e) {
    console.error(e);
  }
}

test();
