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
  return windowScrollY - window.headerHeight;
};

const duration = 300;
const timing = "ease-in-out";

const anchorClick = event => {
  const hash = event.target.hash;
  if (hash !== "") {
    const targetElement = document.querySelector(hash);
    const targetScrollY = targetElement.offsetTop - window.headerHeight;
    scrollToIdSmooth(targetScrollY, duration, timing);
  } else {
    scrollTopSmooth(getWindowScrollY(), duration, timing);
  }
};

let currentFilter = "";
const filterTable = filter => {
  if (currentFilter !== filter) {
    currentFilter = filter;
  } else {
    currentFilter = "";
  }
  const table = document.getElementsByTagName("table")[0];
  const tr = table.getElementsByTagName("tr");
  for (let i = 0; i < tr.length; i++) {
    const td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      const txtValue = td.textContent || td.innerText;
      if (txtValue.indexOf(currentFilter) > -1) {
        tr[i].style.display = "table-row";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
};

const addTableFilter = () => {
  const table = document.getElementsByTagName("table")[0];
  const tr = table.getElementsByTagName("tr");
  for (let i = 0; i < tr.length; i++) {
    const td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      const txtValue = td.textContent || td.innerText;
      td.onclick = () => {
        filterTable(txtValue);
      };
    }
  }
};

window.scrollPos = 0;
window.headerHeightInit = 0;
window.headerHeight = 0;
window.onload = event => {
  console.log("page is fully loaded");
  window.headerHeightInit = document.querySelector("#banner").clientHeight;
  const contentElement = document.querySelector("#content");
  contentElement.style.marginTop = window.headerHeightInit + "px";
  document.addEventListener("scroll", () => {
    window.scrollPos =
      document.documentElement.scrollTop || document.body.scrollTop;
  });
  const anchorLinks = document.querySelectorAll("a[href^='#']");
  for (let i = 0; i < anchorLinks.length; i++) {
    anchorLinks[i].addEventListener("click", anchorClick);
  }
  addTableFilter();
};
window.onscroll = event => {
  // console.log("window.scrollPos: ", window.scrollPos);
  const headerHeight = document.querySelector("#banner").clientHeight;
  const contentElement = document.querySelector("#content");
  window.headerHeight = headerHeight;
  // Change margin-top onscroll, but when we scroll back to top (scrollPos == 0)
  // clientHeight will not receive as it first loaded.
  // So we declare init and scroll header height, set margin-top to initial
  // header height and only set margin-top when scroll header height are
  // different from init header height.
  if (window.scrollPos > 0) {
    document.getElementById("banner").classList.add("sticky");
    document.getElementById("social-icons").classList.add("sticky");
    if (headerHeightInit !== headerHeight) {
      contentElement.style.marginTop = window.headerHeight + "px";
    }
  } else {
    document.getElementById("banner").classList.remove("sticky");
    document.getElementById("social-icons").classList.remove("sticky");
    contentElement.setAttribute(
      "style",
      "margin-top: " + window.headerHeightInit + "px;"
    );
  }

  // Scroll indicator
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const scrolled = (window.scrollPos / height) * 100;
  document.getElementById("my-progress-bar").style.width = scrolled + "%";
};
