console.log("loaded azo archives");
function azo(blog, length) {
  return {
    list: [],
    post: false,
    loading: false,
    init() {

      const breakpoints = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
      };

      const width = Object.keys(breakpoints).reduce((result, breakpoint) => {
        if (window.innerWidth < breakpoints[breakpoint]) {
          return breakpoint;
        }
        return result;
      }, "2xl");

    },
    loadlist(length) {
      const postId = document.querySelector('meta[name="postid"]').content
      url = `https://us-east-1.aws.data.mongodb-api.com/app/azoio-evvkb/endpoint/list?size=${
        length || 1
      }`;
      if (blog) url = url + `&blog=${blog}`;
      if (postId) url += `&post=${postId}`;
      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          if (!length) json = json.sort(() => Math.random() - 0.5);
          //filter out current post
          if (window.location.hash) {
            id = window.location.hash.substring(1);
            json = json.filter((x) => x._id != id);
          }
          this.list = json.slice(0, length || 1);
          this.list.forEach((el) => {
            if (postId) {
              baseurl = `https://allwomenstalk.com/explore/?from=${postId}`;
            } else {
              baseurl = `https://allwomenstalk.com/explore/`;
            }
            
            el.url = baseurl + `#${el._id}`;
            // published content 
            if (el.hasContent) el.url = `https://allwomenstalk.com/explore/${el._id}.html`;
          });
        });
    },
    check(index) {
      // console.log("checking", index, this.list.length);
      if (this.list.length > 0) return false;
      var element = document.querySelector("#azo-" + index);
      var position = element.getBoundingClientRect();

      // checking whether fully visible
      if (position.top >= 0 && position.bottom <= window.innerHeight) {
        console.log("Element is fully visible in screen");
        this.loadlist(length || 3);
      }
    },
  };
}
