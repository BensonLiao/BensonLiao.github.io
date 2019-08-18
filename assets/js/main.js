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

// For window.scrollY || pageYOffset compatibility, same as pageXOffset
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
/**
 * Smooth scroll to element id or top of page
 * @param {object} event - event object
 */
const smoothScroll = event => {
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
/**
 * Filter table row by string
 * @param {string} filter - filter string
 */
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

/**
 * Add filter function to the first table element
 */
const addTableFilter = () => {
  if (document.getElementsByTagName("table").length === 0) return;
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

// Animation style for dropup
const dropupContent =
  "max-height: 0;position: absolute;bottom: 60px;background-color: #f1f1f1;width: 100%;max-width: 100px;box-shadow: 0px 8px 16px 0px rgba($base-color-link-hover, 0.2);z-index: 1;overflow: auto;direction: ltr;transition: max-height 0.2s ease-out;";
const dropupContentShow =
  "max-height: 500px;transition: max-height 0.2s ease-in;";
const dropuptn =
  "background-color: $base-color;color: $base-color-text;width: 60px;height: 60px;font-size: 24px;border: none;transition: background-color 0.2s ease-out, width 0.2s ease-out;";
const dropuptnShow =
  "background-color: $base-color-gradient;width: 100px;transition: background-color 0.2s ease-in, width 0.2s ease-in;";

/**
 * Add event to dropup element for mobile or desktop
 */
const addDropupEvent = () => {
  const hasTouch = "ontouchstart" in window || navigator.msMaxTouchPoints > 0;
  const contentElement = document.querySelector("#content");
  const dropup = document.querySelector("#dropup");
  const dropupContent = document.querySelector(".dropup-content");
  const dropbtn = document.querySelector("#dropup-btn");
  if (hasTouch) {
    let isDropUpOpen = false;
    contentElement.ontouchstart = event => {
      if (
        !isDropUpOpen &&
        (event.target.id === "dropup-btn" ||
          event.target.id === "dropup-btn-icon")
      ) {
        isDropUpOpen = true;
        dropupContent.setAttribute("style", dropupContentShow);
        dropbtn.setAttribute("style", dropuptnShow);
      } else {
        isDropUpOpen = false;
        dropupContent.setAttribute("style", dropupContent);
        dropbtn.setAttribute("style", dropuptn);
        if (event.target.href !== undefined) {
          if (event.target.href.indexOf("#") !== -1) {
            smoothScroll(event);
          } else if (event.target.className === "dropup-content-link") {
            window.open(event.target.href, "_self");
          } else {
            window.open(event.target.href);
          }
        }
      }
    };
  } else {
    dropup.onmouseover = () => {
      dropupContent.setAttribute("style", dropupContentShow);
      dropbtn.setAttribute("style", dropuptnShow);
    };
    dropup.onmouseout = () => {
      dropupContent.setAttribute("style", "");
      dropbtn.setAttribute("style", "");
    };
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
    anchorLinks[i].addEventListener("click", smoothScroll);
  }
  addTableFilter();
  addDropupEvent();
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
