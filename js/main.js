// Blog loader (simple example, loads a list of markdown files)
if (document.getElementById('blog-list')) {
  fetch('/blog-posts/index.json')
    .then(res => res.json())
    .then(posts => {
      const list = document.getElementById('blog-list');
      posts.forEach(post => {
        const div = document.createElement('div');
        div.innerHTML = `<h2>${post.title}</h2><p>${post.date}</p><a href="/blog-posts/${post.file}">Read more</a>`;
        list.appendChild(div);
      });
    });
}

// Contact form handler (AJAX)
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('form-status');
    status.textContent = 'Sending...';
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch('/api/contact.php', {
      method: 'POST',
      body: new URLSearchParams(data)
    });
    status.textContent = res.ok ? 'Message sent!' : 'Error sending message.';
    form.reset();
  });
}