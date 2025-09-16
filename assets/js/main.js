// Blog loader (simple example, loads a list of markdown files)
if (document.getElementById('blog-list')) {
  fetch('/posts/index.json')
    .then(res => res.json())
    .then(posts => {
      const list = document.getElementById('blog-list');
      posts.forEach(post => {
        const div = document.createElement('div');
        div.innerHTML = `<h2>${post.title}</h2><p>${post.date}</p><a href="/posts/${post.file}.html">Read more</a>`;
        list.appendChild(div);
      });
    });
}
