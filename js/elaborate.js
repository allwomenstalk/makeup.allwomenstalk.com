function elaborateComponent() {
  return {
    postid: '',
    page: '',
    label: '',
    response: '',

    init(postid, page) {
      this.postid = postid;
      this.page = page;
      this.label = this.getRandomLabel() + ' ...';
    },

    getRandomLabel() {
      const labels = ['Elaborate', 'Expand', 'More', 'Details'];
      return labels[Math.floor(Math.random() * labels.length)];
    },

    async fetchData() {
      console.log(JSON.stringify({ postid: this.postid, page: this.page }));

      try {
        const response = await fetch("https://us-central1.gcp.data.mongodb-api.com/app/allwomenstalk-ebogu/endpoint/elaborate", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postid: this.postid, page: this.page }),
          redirect: 'follow'
        });
        const result = await response.text();
        console.log('result', JSON.parse(result));
        return result;
      } catch (error) {
        console.log('error', error);
        return null;
      }
    },

    async handleClick(button) {
      button.disabled = true;
      button.innerText = 'Loading...';

      const result = await this.fetchData();
      if (result) {
        const obj = JSON.parse(result);
        this.response = obj.response;
      }

      // Reset the button
      this.label = this.getRandomLabel() + ' ...';
      button.disabled = false;
    }
  };
}

/**
async function fetchData(postid, page) {
  console.log(JSON.stringify({ postid:postid, page:page }))

    try {
      const response = await fetch("https://us-central1.gcp.data.mongodb-api.com/app/allwomenstalk-ebogu/endpoint/elaborate", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postid:postid, page:page }),
        redirect: 'follow'
      });
      const result = await response.text();
      console.log('result', JSON.parse(result))
      return result;
    } catch (error) {
      console.log('error', error);
      return null;
    }
  }

console.log('elaborate.js started onload');

const elaborateDivs = document.querySelectorAll('.elaborate');

elaborateDivs.forEach((elaborateDiv, index) => {
  const button = document.createElement('button');
  labels = ['Elaborate', 'Expand', 'More', 'Details']
  button.innerText = labels[Math.floor(Math.random() * labels.length)] +" ...";
  button.classList.add('_elaborate', 'relative', 'inline-flex', 'items-center', 'gap-x-1.5', 'rounded-md', 'px-3', 'py-2', 'text-sm', 'font-semibold', 'ring-1', 'ring-inset', 'ring-gray-300', 'hover:bg-gray-50', 'hover:text-gray-900', 'focus:z-10');
  button.setAttribute('data-index', elaborateDiv.getAttribute('data-page')); // Set custom attribute with the index value

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.innerText = 'Loading...';

    const postid = document.querySelector('meta[name="postid"]').content
    const page = button.getAttribute('data-index'); // Retrieve the index value from the button
    const result = await fetchData(postid, page);
    const obj = JSON.parse(result);
    beacontrack({ type: 'eleborate', action:1,  post_id: postid, item: {page:page, label:button.innerText} })        


    // Handle the response as needed for the 'elaborate' div
    // Example: Update the innerHTML of the 'elaborate' div with the response
    elaborateDiv.innerHTML = obj.response;
  });

  elaborateDiv.appendChild(button);
});
*/