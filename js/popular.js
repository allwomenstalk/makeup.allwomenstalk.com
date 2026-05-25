
popular = {
    html: `
    <template x-for="(item, index) in list.popular">
  
    <a x-bind:href="item.url" class="w-40 text-gray-900 rounded-lg hover:opacity-70 relative" x-bind:title="item.title">
      <div class="text-center overflow-hidden bg-cover bg-center rounded-t cardimage">
        <img class="w-full lazyload" width="200" height="200" x-bind:src="item.image+'?width=400&height=400'" alt="How Engagement Rings Have Changed over the Years ..." loading="lazy" decoding="async">
      </div>
      <div class="border-r border-b border-l border-gray-300 rounded-b p-4 flex flex-col justify-between leading-normal h-56 cardtitle bg-white dark:bg-gray-900">
        <div>
          <p class="text-xs text-gray-700 flex items-center uppercase" x-text="item.category"></p>
          <h2 class="uppercase my-2 text-xs" x-text="item.title"></h2>
          <p class="text-gray-700 text-base"></p>
        </div>
        <div class="flex items-center opacity-70">
          <div class="text-xs">
            <button class="rounded px-2 py-1 absolute right-3 bottom-4" aria-label="Read more">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <use xlink:href="#moreicon"></use>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </a>
  </template>
    `, 
      load: async function () {
          const postId = document.querySelector('meta[name="postid"]').content
          const url = `https://allwomenstalk.com/popular/list.json`;
          const response = await fetch(url);
          const list = (await response.json())
          arr = list.items
          return arr.sort(() => Math.random() - 0.5);
      }
  }
  
  