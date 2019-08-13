const TIMINGFUNC_MAP = {
  linear: t => t,
  "ease-in": t => t * t,
  "ease-out": t => t * (2 - t),
  "ease-in-out": t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
};

/**
 * Scroll from initY to 0
 * @param {number} initY - initial scroll Y
 * @param {number} duration - transition duration
 * @param {string} timingName - timing function name. Can be one of linear, ease-in, ease-out, ease-in-out
 */
const scrollTopSmooth = (initY, duration = 300, timingName = "linear") => {
  const timingFunc = TIMINGFUNC_MAP[timingName];
  let start = null;
  const step = timestamp => {
    start = start || timestamp;
    const progress = timestamp - start,
      // Growing from 0 to 1
      time = Math.min(1, (timestamp - start) / duration);
    const scrollY = initY - timingFunc(time) * initY;
    window.scrollTo(0, scrollY);
    if (progress < duration) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

/**
 * Scroll to targetY by element id
 * @param {number} targetY - target scroll Y
 * @param {number} duration - transition duration
 * @param {string} timingName - timing function name. Can be one of linear, ease-in, ease-out, ease-in-out
 */
const scrollToIdSmooth = (targetY, duration = 300, timingName = "linear") => {
  console.log("targetY", targetY);
  const timingFunc = TIMINGFUNC_MAP[timingName];
  let start = null;
  const step = timestamp => {
    start = start || timestamp;
    const progress = timestamp - start,
      // Growing from 0 to 1
      time = Math.min(1, (timestamp - start) / duration);
    const scrollY = timingFunc(time) * targetY;
    window.scrollTo(0, scrollY);
    if (progress < duration) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

// For window.scrollY || pageYOffset compatibility
const getWindowScrollY = () => {
  const supportPageOffset =
    window.pageYOffset !== undefined || window.scrollY !== undefined;
  const isCSS1Compat = (document.compatMode || "") === "CSS1Compat";
  const windowScrollY = supportPageOffset
    ? window.pageYOffset
    : isCSS1Compat
    ? document.documentElement.scrollTop
    : document.body.scrollTop;
  return windowScrollY;
};

const duration = 300;
const timing = "ease-in-out";

const anchorClick = event => {
  console.log("anchor clicks");
  const hash = event.target.hash;
  if (hash !== "") {
    const targetElement = document.querySelector(hash);
    const targetScrollY = targetElement.offsetTop;
    scrollToIdSmooth(targetScrollY, duration, timing);
  } else {
    scrollTopSmooth(getWindowScrollY(), duration, timing);
  }
};

window.scrollPos = 0;
window.onload = event => {
  console.log("page is fully loaded");
  document.addEventListener("scroll", () => {
    window.scrollPos =
      document.documentElement.scrollTop || document.body.scrollTop;
  });
  const anchorLinks = document.querySelectorAll("a[href^='#']");
  for (let i = 0; i < anchorLinks.length; i++) {
    anchorLinks[i].addEventListener("click", anchorClick);
  }
};
window.onscroll = event => {
  // console.log("window.scrollPos: ", window.scrollPos);
  if (window.scrollPos > 0) {
    document.getElementById("banner").classList.add("sticky");
    document.getElementById("social-icons").classList.add("sticky");
  } else {
    document.getElementById("banner").classList.remove("sticky");
    document.getElementById("social-icons").classList.remove("sticky");
  }

  // Scroll indicator
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const scrolled = (window.scrollPos / height) * 100;
  document.getElementById("my-progress-bar").style.width = scrolled + "%";
};
