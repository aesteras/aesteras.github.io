// SPA

// serverless workaround
const known = ['/', '/home', '/about-me', '/contact', '/projects', '/this-website', '/webcrypto'];

const fetchResource = async path => {
  let isKnown = false;
  for (let i = 0; i < known.length; i++) {
    if (path == known[i]) {
      isKnown = true;
    }
  }
  if (!isKnown) {
    path = '/404';
  }
  let target = document.getElementById('main');
  try {
    let response = await fetch('api' + path + '.html');
    let html = await response.text();
    target.innerHTML = html;
  } catch (err) {
    console.log(err);
  } finally {
    let posters = document.getElementsByClassName('poster');
    for (let i = 0; i < posters.length; i++) {
      posters[i].onload = repositionIfNeeded;
    }
    let profiles = document.getElementsByClassName('profile-container');
    if (profiles) {
      for (let i = 0; i < posters.length; i++) {
        profiles[i].onload = repositionIfNeeded;
      }
    }
  }
}

const pushToHistory = (currPath, nextPath) => {
  let state = {
    curr: currPath,
    next: nextPath
  };
  console.log('pushing: ' + JSON.stringify(state));
  window.history.pushState(state, currPath[0].toUpperCase() + currPath.slice(1), nextPath);
  window.scrollTo(0, 0);
};

const onClickNav = nextPath => {
  let btn = document.getElementById('header-menu-button');
  let nav = document.getElementById('site-header-nav');
  let hdr = document.getElementById('site-header');
  let currPath = window.location.pathname;
  if (menuIsVisible) {
    nav.classList.remove('menu-enabled');
    hdr.classList.remove('header-bottom-border');
    btn.innerHTML = svgMenu;
    menuIsVisible = false;
  }
  fetchResource(nextPath);
  pushToHistory(currPath, nextPath);
};

window.onpopstate = event => {
  if (event.state) {
    console.log('popping:' + JSON.stringify(event.state));
    fetchResource(event.state.next);
  }
};

// On Page Load / Reload

window.onload = async () => {
  let currPath = window.location.pathname;
  if (currPath == '/') {
    currPath = '/home';
  }
  let state = {
    curr: currPath,
    next: currPath
  };
  fetchResource(currPath);
  window.history.replaceState(state, currPath[0].toUpperCase() + currPath.slice(1), currPath);
};

// Menu Open And Close On Click Button

let menuIsVisible = false;
const svgClose = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
const svgMenu = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';

const onClickMenu = () => {
  let btn = document.getElementById('header-menu-button');
  let nav = document.getElementById('site-header-nav');
  let hdr = document.getElementById('site-header');
  if (menuIsVisible) {
    nav.classList.remove('menu-enabled');
    hdr.classList.remove('header-bottom-border');
    btn.innerHTML = svgMenu;
    menuIsVisible = false;
  } else {
    nav.classList.add('menu-enabled');
    hdr.classList.add('header-bottom-border');
    btn.innerHTML = svgClose;
    menuIsVisible = true;
  }
};

// Menu Hide And Show On Scroll

let pos = {
  prev: 0,
  curr: 0
};

window.onscroll = () => {
  pos.curr = document.documentElement.scrollTop;
  let siteHeader = document.getElementById('site-header');
  if (pos.curr > pos.prev + 1 && !menuIsVisible) {
    siteHeader.classList.remove('site-header-pinned');
    siteHeader.classList.add('site-header-unpinned');
  } else if (pos.curr + 1 < pos.prev && !menuIsVisible) {
    siteHeader.classList.remove('site-header-unpinned');
    siteHeader.classList.add('site-header-pinned');
  }
  if (pos.curr > 0) {
    siteHeader.classList.remove('site-header-top');
    siteHeader.classList.add('site-header-not-top');
  } else {
    siteHeader.classList.remove('site-header-not-top');
    siteHeader.classList.add('site-header-top');
  }
  pos.prev = pos.curr;
};

// Posters

const repositionIfNeeded = () => {
  let containerHeight = 30 * 16;  // rem * root-font-size
  let posters = document.getElementsByClassName('poster');
  let profiles = document.getElementsByClassName('profile-container');
  for (let i = 0; i < posters.length; i++) {
    let imageHeight = posters[i].height;
    if (imageHeight > containerHeight) {
      let newTop = (imageHeight - containerHeight) * -0.5;
      posters[i].style['top'] = Math.floor(newTop) + 'px';
      for (let j = 0; j < profiles.length; j++) {
        let profileTop = 16 * (3 + 30 - 7.5);
        profiles[j].style['top'] = profileTop + 'px'
      }
    } else {
      posters[i].style['top'] = 0 + 'px';
      for (let j = 0; j < profiles.length; j++) {
        // root-font-size * (main-top-padding - profileHeight/2) + imageHeight
        let profileTop = 16 * (2.5 - 7.5) + imageHeight;
        profiles[j].style['top'] = profileTop + 'px';
      }
    }
  }
};

window.onresize = repositionIfNeeded;