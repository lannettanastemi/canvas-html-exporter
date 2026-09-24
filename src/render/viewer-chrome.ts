import type { getTheme } from "./theme";

type Theme = ReturnType<typeof getTheme>;

const ICON_PATHS = {
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.4 15.4L20 20",
  minimap: "M9 4.5L3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2-6-2zM9 4.5v13M15 6.5v13",
  folding: "M12 4l8.5 4.5L12 13 3.5 8.5zM3.5 12.5L12 17l8.5-4.5M3.5 16.5L12 21l8.5-4.5",
  minus: "M5.5 12h13",
  plus: "M12 5.5v13M5.5 12h13",
  fit: "M4.5 9V4.5H9M15 4.5h4.5V9M19.5 15v4.5H15M9 19.5H4.5V15",
  close: "M6.5 6.5l11 11M17.5 6.5l-11 11",
  chevronLeft: "M15 5l-7 7 7 7",
  chevronRight: "M9 5l7 7-7 7",
  external: "M14 4.5h5.5V10M19.5 4.5l-8 8M17.5 13.5v4.5a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V8A1.5 1.5 0 0 1 6 6.5h4.5",
} as const;

export type ViewerIconName = keyof typeof ICON_PATHS;

export function viewerIcon(name: ViewerIconName, size = 18, strokeWidth = 2): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${ICON_PATHS[name]}"/></svg>`;
}

const MOTION = {
  spring: "linear(0, 0.015 2%, 0.043 3.5%, 0.079 5%, 0.154 7.5%, 0.372 14%, 0.481 17.5%, 0.565 20.5%, 0.639 23.5%, 0.702 26.5%, 0.765 30%, 0.815 33.5%, 0.861 37.5%, 0.899 42%, 0.931 47%, 0.954 52.5%, 0.971 58.5%, 0.991 73.5%, 1)",
  lift: "linear(0, 0.006 1.5%, 0.029 3.5%, 0.067 5.5%, 0.115 7.5%, 0.217 11%, 0.571 22%, 0.67 25.5%, 0.745 28.5%, 0.821 32%, 0.874 35%, 0.926 38.5%, 0.965 42%, 0.995 45.5%, 1.018 49.5%, 1.033 54%, 1.04 59%, 1.037 68%, 1)",
  bounce: "linear(0, 0.006 1%, 0.039 2.5%, 0.094 4%, 0.168 5.5%, 0.257 7%, 0.356 8.5%, 0.815 15%, 0.97 17.5%, 1.074 19.5%, 1.16 21.5%, 1.21 23%, 1.259 25%, 1.288 27%, 1.297 28.5%, 1.297 30%, 1.289 31.5%, 1.267 33.5%, 1.217 36.5%, 1.06 44%, 0.997 47.5%, 0.944 51.5%, 0.917 55.5%, 0.911 59%, 0.919 62.5%, 0.997 76%, 1.022 83%, 1.023 92.5%, 1.011 99.5%, 1)",
};

export function buildViewerChromeStyles(theme: Theme): string {
  const glass = theme.darkMode
    ? {
      surface: "rgba(34, 38, 46, 0.62)",
      strong: "rgba(30, 34, 41, 0.94)",
      border: "rgba(255, 255, 255, 0.12)",
      highlight: "rgba(255, 255, 255, 0.10)",
      shadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
      hover: "rgba(255, 255, 255, 0.10)",
      press: "rgba(255, 255, 255, 0.16)",
      dots: "rgba(255, 255, 255, 0.16)",
    }
    : {
      surface: "rgba(255, 255, 255, 0.72)",
      strong: "rgba(255, 255, 255, 0.95)",
      border: "rgba(20, 30, 40, 0.10)",
      highlight: "rgba(255, 255, 255, 0.85)",
      shadow: "0 10px 30px rgba(20, 30, 40, 0.12)",
      hover: "rgba(20, 30, 40, 0.06)",
      press: "rgba(20, 30, 40, 0.10)",
      dots: "rgba(0, 0, 0, 0.14)",
    };

  return `
    :root {
      --cx-spring: ${MOTION.spring};
      --cx-lift: ${MOTION.lift};
      --cx-bounce: ${MOTION.bounce};
      --cx-surface: ${glass.surface};
      --cx-surface-strong: ${glass.strong};
      --cx-border: ${glass.border};
      --cx-highlight: ${glass.highlight};
      --cx-shadow: ${glass.shadow};
      --cx-hover: ${glass.hover};
      --cx-press: ${glass.press};
      --cx-accent: ${theme.link};
    }
    body {
      background: ${theme.canvasBackground};
    }
    #canvas-shell {
      position: relative;
      overflow: hidden;
    }
    .viewport {
      position: absolute;
      inset: 0;
      padding: 0;
      background-color: ${theme.canvasBackground};
      background-image: radial-gradient(${glass.dots} 1px, transparent 1px);
      background-size: 20px 20px;
      background-attachment: local;
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .viewport::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
    #canvas {
      background: none;
    }
    .cx-glass {
      background: var(--cx-surface);
      border: 1px solid var(--cx-border);
      box-shadow: inset 0 1px 0 var(--cx-highlight), var(--cx-shadow);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
    }
    .toolbar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: nowrap;
      gap: 12px;
      padding: 12px 14px;
      background: none;
      pointer-events: none;
    }
    .toolbar > * {
      pointer-events: auto;
    }
    .toolbar-lead {
      display: flex;
      align-items: stretch;
      gap: 8px;
      min-width: 0;
    }
    .toolbar-nav {
      margin-right: 0;
    }
    .toolbar .toolbar-nav a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 46px;
      padding: 0 16px 0 12px;
      border-radius: 14px;
      border: 1px solid var(--cx-border);
      background: var(--cx-surface);
      box-shadow: inset 0 1px 0 var(--cx-highlight), var(--cx-shadow);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      color: ${theme.text};
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
      transition: background-color 0.15s ease, scale 0.76s var(--cx-bounce);
    }
    .toolbar .toolbar-nav a:hover {
      background: var(--cx-surface-strong);
    }
    .toolbar .toolbar-nav a:active {
      scale: 0.96;
      transition: background-color 0.15s ease, scale 0.36s var(--cx-lift);
    }
    .toolbar-title {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
      min-width: 0;
      height: 46px;
      padding: 0 16px;
      border-radius: 14px;
    }
    .toolbar-title h1 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: min(46vw, 560px);
    }
    .toolbar-title p {
      margin: 0;
      color: ${theme.mutedText};
      font-size: 0.74rem;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 2px;
      height: 46px;
      padding: 0 5px;
      border-radius: 14px;
      flex: 0 0 auto;
    }
    .toolbar .toolbar-actions > button,
    .toolbar .toolbar-actions > .toolbar-menu > summary {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      padding: 0;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: ${theme.text};
      cursor: pointer;
      transition: background-color 0.15s ease, color 0.15s ease, scale 0.76s var(--cx-bounce);
    }
    .toolbar .toolbar-actions > button:hover,
    .toolbar .toolbar-actions > .toolbar-menu > summary:hover,
    .toolbar .toolbar-actions > .toolbar-menu[open] > summary {
      background: var(--cx-hover);
    }
    .toolbar .toolbar-actions > button:active,
    .toolbar .toolbar-actions > .toolbar-menu > summary:active {
      scale: 0.9;
      background: var(--cx-press);
      transition: background-color 0.15s ease, scale 0.36s var(--cx-lift);
    }
    .toolbar .toolbar-actions > button.is-active {
      border: none;
      box-shadow: none;
      color: var(--cx-accent);
      background: color-mix(in srgb, var(--cx-accent) 18%, transparent);
    }
    .toolbar .toolbar-actions > .toolbar-menu > summary::after {
      content: none;
    }
    .toolbar .toolbar-menu-content {
      top: calc(100% + 10px);
      right: -5px;
      gap: 2px;
      min-width: 230px;
      padding: 6px;
      border: 1px solid var(--cx-border);
      border-radius: 14px;
      background: var(--cx-surface-strong);
      box-shadow: inset 0 1px 0 var(--cx-highlight), var(--cx-shadow);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      transform-origin: top right;
      animation: cx-pop-in 0.4s var(--cx-spring) both;
    }
    .toolbar .toolbar-menu-content button {
      border: none;
      border-radius: 9px;
      padding: 8px 10px;
      background: transparent;
      color: ${theme.text};
      font-size: 0.85rem;
    }
    .toolbar .toolbar-menu-content button:hover:not(:disabled) {
      background: var(--cx-hover);
    }
    .toolbar .toolbar-menu-content button.is-active {
      color: var(--cx-accent);
      background: color-mix(in srgb, var(--cx-accent) 16%, transparent);
      box-shadow: none;
    }
    .toolbar .toolbar-menu-content select {
      border: 1px solid var(--cx-border);
      border-radius: 9px;
      padding: 7px 8px;
      background: transparent;
      color: ${theme.text};
      font-size: 0.85rem;
    }
    .toolbar .folding-menu-separator {
      border-top-color: var(--cx-border);
    }
    @keyframes cx-pop-in {
      from { opacity: 0; scale: 0.94; }
      to { opacity: 1; scale: 1; }
    }
    .zoom-pill {
      position: absolute;
      right: 14px;
      bottom: 14px;
      z-index: 11;
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 4px;
      border-radius: 999px;
    }
    .zoom-pill button {
      display: grid;
      place-items: center;
      min-width: 34px;
      height: 34px;
      padding: 0;
      border: none;
      border-radius: 999px;
      background: transparent;
      color: ${theme.text};
      font: inherit;
      cursor: pointer;
      transition: background-color 0.15s ease, scale 0.76s var(--cx-bounce);
    }
    .zoom-pill button:hover {
      background: var(--cx-hover);
    }
    .zoom-pill button:active {
      scale: 0.9;
      background: var(--cx-press);
      transition: background-color 0.15s ease, scale 0.36s var(--cx-lift);
    }
    .zoom-pill .zoom-pill-level {
      min-width: 58px;
      padding: 0 8px;
      font-size: 0.78rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .zoom-pill-divider {
      width: 1px;
      height: 18px;
      margin: 0 3px;
      background: var(--cx-border);
    }
    .minimap {
      border: 1px solid var(--cx-border);
      border-radius: 16px;
      background: var(--cx-surface-strong);
      box-shadow: inset 0 1px 0 var(--cx-highlight), var(--cx-shadow);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
    }
    .search-overlay {
      background: rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }
    .search-panel {
      border: 1px solid var(--cx-border);
      border-radius: 18px;
      background: var(--cx-surface-strong);
      box-shadow: inset 0 1px 0 var(--cx-highlight), var(--cx-shadow);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      animation: cx-pop-in 0.4s var(--cx-spring) both;
    }
    @media (max-width: 640px) {
      .toolbar {
        padding: 10px;
        gap: 8px;
      }
      .toolbar-title h1 {
        max-width: 38vw;
      }
      .toolbar-title p {
        display: none;
      }
      .toolbar .toolbar-nav a {
        padding: 0 12px 0 10px;
      }
    }
    .lightbox {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.9);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      animation: cx-fade-in 0.2s ease-out;
    }
    .lightbox[hidden] {
      display: none;
    }
    @keyframes cx-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .lightbox-stage {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      touch-action: none;
    }
    .lightbox-image {
      max-width: 92vw;
      max-height: 86vh;
      object-fit: contain;
      user-select: none;
      -webkit-user-drag: none;
      border-radius: 6px;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
      will-change: transform;
      transition: transform 0.4s var(--cx-spring);
    }
    .lightbox-image.is-entering {
      animation: cx-image-in 0.42s var(--cx-spring) both;
    }
    @keyframes cx-image-in {
      from { opacity: 0; scale: 0.9; }
      35% { opacity: 1; }
      to { opacity: 1; scale: 1; }
    }
    .lightbox-close,
    .lightbox-nav,
    .lightbox-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: none;
      color: #fff;
      cursor: pointer;
      background: rgb(255 255 255 / 0.12);
      background-image: linear-gradient(to bottom, rgb(255 255 255 / 0.12), transparent 60%);
      backdrop-filter: blur(14px) saturate(180%);
      -webkit-backdrop-filter: blur(14px) saturate(180%);
      box-shadow: inset 0 0 0 0.5px rgb(255 255 255 / 0.18), inset 0 1px 0 rgb(255 255 255 / 0.22), 0 6px 14px -4px rgb(0 0 0 / 0.45);
      transition: background-color 0.15s, opacity 0.15s, scale 0.76s var(--cx-bounce);
    }
    .lightbox-close:hover,
    .lightbox-nav:hover,
    .lightbox-button:hover:not(:disabled) {
      background-color: rgb(255 255 255 / 0.22);
    }
    .lightbox-close:active,
    .lightbox-nav:active,
    .lightbox-button:active:not(:disabled) {
      scale: 1.12;
      transition: background-color 0.15s, opacity 0.15s, scale 0.36s var(--cx-lift);
    }
    .lightbox-close {
      position: absolute;
      top: 16px;
      right: 20px;
      z-index: 1;
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
    .lightbox-nav {
      position: absolute;
      top: 50%;
      translate: 0 -50%;
      z-index: 1;
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }
    .lightbox-nav[hidden],
    .lightbox-counter[hidden] {
      display: none;
    }
    .lightbox-prev {
      left: 20px;
    }
    .lightbox-next {
      right: 20px;
    }
    .lightbox-toolbar {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      border-radius: 999px;
      background: rgb(40 40 44 / 0.55);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      box-shadow: inset 0 0 0 0.5px rgb(255 255 255 / 0.14), inset 0 1px 0 rgb(255 255 255 / 0.18), 0 10px 28px rgb(0 0 0 / 0.4);
    }
    .lightbox-button {
      width: 34px;
      height: 34px;
      border-radius: 999px;
    }
    .lightbox-toolbar .lightbox-button {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      box-shadow: none;
      background-color: transparent;
      background-image: none;
    }
    .lightbox-button:disabled {
      opacity: 0.35;
      cursor: default;
    }
    .lightbox-zoom-label {
      min-width: 44px;
      color: rgba(255, 255, 255, 0.75);
      font-size: 12px;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }
    .lightbox-counter {
      position: absolute;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      padding: 4px 12px;
      border-radius: 10px;
      background: rgba(40, 40, 44, 0.7);
      color: rgba(255, 255, 255, 0.8);
      font-size: 13px;
      font-variant-numeric: tabular-nums;
    }
    .node.file:has(> .node-content > a:only-child > img:only-child) {
      padding: 0;
    }
    .node.file > .node-content:has(> a:only-child > img:only-child) {
      display: flex;
      overflow: hidden;
    }
    .node.file > .node-content > a:only-child:has(> img:only-child) {
      display: flex;
      flex: 1 1 auto;
      min-width: 0;
      min-height: 0;
    }
    .node.file > .node-content > a:only-child > img:only-child {
      width: 100%;
      height: 100%;
      max-width: none;
      margin: 0;
      border-radius: 0;
      object-fit: contain;
    }
    .node-content img {
      cursor: zoom-in;
    }
    .link-card img {
      cursor: pointer;
    }
    @media (prefers-reduced-motion: reduce) {
      .lightbox,
      .lightbox-image.is-entering,
      .toolbar .toolbar-menu-content,
      .search-panel {
        animation: none;
      }
      .lightbox-image {
        transition: none;
      }
    }
  `;
}

export function buildViewerChromeRuntime(): string {
  const icon = (name: ViewerIconName, size: number, strokeWidth = 2) => JSON.stringify(viewerIcon(name, size, strokeWidth));
  return `
      const zoomLevelButton = document.getElementById("zoom-level");
      if (zoomLevelButton && canvas) {
        const syncZoomLevel = () => {
          const match = /scale\\(([\\d.]+)\\)/.exec(canvas.style.transform || "");
          zoomLevelButton.textContent = Math.round((match ? parseFloat(match[1]) : 1) * 100) + "%";
        };
        new MutationObserver(syncZoomLevel).observe(canvas, { attributes: true, attributeFilter: ["style"] });
        syncZoomLevel();
      }

      const lightbox = (() => {
        const MIN_SCALE = 1;
        const MAX_SCALE = 5;
        const SCALE_STEP = 0.5;
        const WHEEL_STEP = 60;
        let root = null;
        let image = null;
        let counter = null;
        let zoomLabel = null;
        let prevButton = null;
        let nextButton = null;
        let zoomOutButton = null;
        let zoomInButton = null;
        let resetButton = null;
        let closeButton = null;
        let originalLink = null;
        let items = [];
        let index = 0;
        let scale = 1;
        let posX = 0;
        let posY = 0;
        let drag = null;
        let dragFrame = 0;
        let wheelAccumulator = 0;
        let returnFocus = null;

        function createButton(className, title, iconHtml, onClick) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = className;
          button.title = title;
          button.setAttribute("aria-label", title);
          button.innerHTML = iconHtml;
          button.addEventListener("click", (event) => {
            event.stopPropagation();
            onClick();
          });
          return button;
        }

        function build() {
          root = document.createElement("div");
          root.className = "lightbox";
          root.hidden = true;
          root.setAttribute("role", "dialog");
          root.setAttribute("aria-modal", "true");
          root.setAttribute("aria-label", "Image viewer");

          closeButton = createButton("lightbox-close", "Close (Esc)", ${icon("close", 20, 2.2)}, close);
          prevButton = createButton("lightbox-nav lightbox-prev", "Previous (←)", ${icon("chevronLeft", 24, 2.2)}, () => step(-1));
          nextButton = createButton("lightbox-nav lightbox-next", "Next (→)", ${icon("chevronRight", 24, 2.2)}, () => step(1));
          counter = document.createElement("div");
          counter.className = "lightbox-counter";

          const stage = document.createElement("div");
          stage.className = "lightbox-stage";
          image = document.createElement("img");
          image.className = "lightbox-image";
          image.alt = "";
          image.draggable = false;
          stage.appendChild(image);

          const toolbar = document.createElement("div");
          toolbar.className = "lightbox-toolbar";
          zoomOutButton = createButton("lightbox-button", "Zoom out (−)", ${icon("minus", 18, 2.2)}, () => zoom(-SCALE_STEP));
          zoomLabel = document.createElement("span");
          zoomLabel.className = "lightbox-zoom-label";
          zoomInButton = createButton("lightbox-button", "Zoom in (+)", ${icon("plus", 18, 2.2)}, () => zoom(SCALE_STEP));
          resetButton = createButton("lightbox-button", "Reset zoom (0)", ${icon("fit", 18)}, resetView);
          originalLink = document.createElement("a");
          originalLink.className = "lightbox-button";
          originalLink.title = "Open original in a new tab";
          originalLink.setAttribute("aria-label", originalLink.title);
          originalLink.target = "_blank";
          originalLink.rel = "noopener noreferrer";
          originalLink.innerHTML = ${icon("external", 18)};
          originalLink.addEventListener("click", (event) => event.stopPropagation());
          toolbar.append(zoomOutButton, zoomLabel, zoomInButton, resetButton, originalLink);
          toolbar.addEventListener("click", (event) => event.stopPropagation());

          root.append(closeButton, prevButton, nextButton, counter, stage, toolbar);
          document.body.appendChild(root);

          root.addEventListener("wheel", (event) => {
            event.preventDefault();
            event.stopPropagation();
            wheelAccumulator += event.deltaY;
            if (Math.abs(wheelAccumulator) < WHEEL_STEP) return;
            zoom(wheelAccumulator < 0 ? SCALE_STEP : -SCALE_STEP);
            wheelAccumulator = 0;
          }, { passive: false });

          stage.addEventListener("click", (event) => {
            if (event.target !== image) close();
          });
          image.addEventListener("dblclick", () => {
            if (scale > 1) {
              resetView();
            } else {
              scale = 2;
              applyTransform();
            }
          });
          image.addEventListener("pointerdown", (event) => {
            if (scale <= 1 || event.button !== 0) return;
            event.preventDefault();
            drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: posX, originY: posY };
            image.setPointerCapture(event.pointerId);
            applyTransform();
          });
          image.addEventListener("pointermove", (event) => {
            if (!drag || event.pointerId !== drag.pointerId) return;
            const nextX = drag.originX + event.clientX - drag.startX;
            const nextY = drag.originY + event.clientY - drag.startY;
            if (dragFrame) return;
            dragFrame = window.requestAnimationFrame(() => {
              dragFrame = 0;
              posX = nextX;
              posY = nextY;
              applyTransform();
            });
          });
          const endDrag = (event) => {
            if (!drag || event.pointerId !== drag.pointerId) return;
            drag = null;
            applyTransform();
          };
          image.addEventListener("pointerup", endDrag);
          image.addEventListener("pointercancel", endDrag);
        }

        function collectImages() {
          const entries = Array.from(document.querySelectorAll("#canvas .node-content img"))
            .filter((img) => !img.closest(".link-card") && img.getClientRects().length > 0)
            .map((img, order) => {
              const node = img.closest(".node");
              return {
                img,
                order,
                top: Number(node && node.getAttribute("data-canvas-top")) || 0,
                left: Number(node && node.getAttribute("data-canvas-left")) || 0,
              };
            })
            .sort((a, b) => a.top - b.top || a.left - b.left || a.order - b.order);
          const rows = [];
          entries.forEach((entry) => {
            const row = rows[rows.length - 1];
            if (row && entry.top - row.top < 120) {
              row.items.push(entry);
            } else {
              rows.push({ top: entry.top, items: [entry] });
            }
          });
          return rows.flatMap((row) => row.items.sort((a, b) => a.left - b.left || a.top - b.top || a.order - b.order)).map((entry) => entry.img);
        }

        function applyTransform() {
          if (!image) return;
          image.style.transform = "translate3d(" + posX + "px, " + posY + "px, 0) scale(" + scale + ")";
          image.style.transition = drag ? "none" : "";
          image.style.cursor = scale > 1 ? (drag ? "grabbing" : "grab") : "zoom-in";
          zoomLabel.textContent = Math.round(scale * 100) + "%";
          zoomOutButton.disabled = scale <= MIN_SCALE;
          zoomInButton.disabled = scale >= MAX_SCALE;
          resetButton.disabled = scale === 1 && !posX && !posY;
        }

        function render() {
          const current = items[index];
          if (!current) return;
          image.src = current.currentSrc || current.src;
          image.alt = current.alt || "";
          originalLink.href = image.src;
          image.classList.remove("is-entering");
          void image.offsetWidth;
          image.classList.add("is-entering");
          const multiple = items.length > 1;
          counter.hidden = !multiple;
          prevButton.hidden = !multiple;
          nextButton.hidden = !multiple;
          counter.textContent = (index + 1) + " / " + items.length;
          applyTransform();
        }

        function resetView() {
          scale = 1;
          posX = 0;
          posY = 0;
          applyTransform();
        }

        function zoom(delta) {
          scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round((scale + delta) * 100) / 100));
          if (scale === MIN_SCALE) {
            posX = 0;
            posY = 0;
          }
          applyTransform();
        }

        function step(delta) {
          if (items.length < 2) return;
          index = (index + delta + items.length) % items.length;
          scale = 1;
          posX = 0;
          posY = 0;
          render();
        }

        function onKeydown(event) {
          const actions = {
            Escape: close,
            ArrowLeft: () => step(-1),
            ArrowRight: () => step(1),
            "+": () => zoom(SCALE_STEP),
            "=": () => zoom(SCALE_STEP),
            "-": () => zoom(-SCALE_STEP),
            "_": () => zoom(-SCALE_STEP),
            "0": resetView,
          };
          const action = actions[event.key];
          if (!action) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          action();
        }

        function open(img) {
          if (!root) build();
          items = collectImages();
          index = items.indexOf(img);
          if (index < 0) {
            items = [img];
            index = 0;
          }
          scale = 1;
          posX = 0;
          posY = 0;
          drag = null;
          wheelAccumulator = 0;
          returnFocus = document.activeElement;
          root.hidden = false;
          render();
          window.addEventListener("keydown", onKeydown, true);
          closeButton.focus({ preventScroll: true });
        }

        function close() {
          if (!root || root.hidden) return;
          root.hidden = true;
          drag = null;
          window.removeEventListener("keydown", onKeydown, true);
          if (returnFocus && typeof returnFocus.focus === "function") returnFocus.focus({ preventScroll: true });
        }

        return { open, close };
      })();
      window.openImageViewer = lightbox.open;

      viewport.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const img = target ? target.closest(".node-content img") : null;
        if (!img || img.closest(".link-card")) return;
        const anchor = img.closest("a");
        if (anchor) {
          const href = anchor.getAttribute("href") || "";
          if (href !== img.getAttribute("src") && anchor.href !== img.src) return;
        }
        event.preventDefault();
        lightbox.open(img);
      });
`;
}
