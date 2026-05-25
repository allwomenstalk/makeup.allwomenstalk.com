
azo = {
    html: `
  <template x-for="(item, index) in list.azo">
  
  <div class="max-w-xl mx-auto p-6 border border-gray-200 rounded-lg shadow relative pb-16">
      <a :href="item.url" class="_azoio title">
          <h5 x-text="item.title" class="mb-2 text-xl sm:text-2xl font-bold tracking-tight"></h5>
      </a>
      <p x-text="item.excerpt" class="mb-3 text-xs sm:text-base font-normal opacity-70"></p>
      <a :href="item.url" class="_azoio linkbutton absolute bottom-6 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-pink-700 rounded-lg focus:ring-4 focus:outline-none">
          Read more
          <svg aria-hidden="true" class="w-3 h-4 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
      </a>
  </div>
  
  </template>
    `, 
      load: async function (length = 1, blog = 'food') {
          const postId = document.querySelector('meta[name="postid"]').content
          const url = `https://us-east-1.aws.data.mongodb-api.com/app/azoio-evvkb/endpoint/list?size=${length}&blog=${blog}${postId ? `&post=${postId}` : ''}`;
          const response = await fetch(url);
          const list = (await response.json())
            .filter(item => window.location.hash.substring(1) !== item._id)
            .slice(0, length)
            .map(item => postId ? ({ ...item, url: `https://allwomenstalk.com/explore/?from=${postId}#${item._id}` }) : item);
          return length ? list : list.sort(() => Math.random() - 0.5);
      }
  }
  
  