// Emitted inside the shared browser closure; no external runtime dependency.
export function buildBrowserInteraction(): string {
  return `      function startMinimapDrag(event) {
        if (!minimapPanel || !minimapDragHandle) return;
        const rect = minimapPanel.getBoundingClientRect();
        minimapDrag = {
          offsetX: event.clientX - rect.left,
          offsetY: event.clientY - rect.top,
        };
        minimapPanel.classList.add("is-dragging");
        minimapDragHandle.setPointerCapture(event.pointerId);
        event.preventDefault();
      }

      function moveMinimap(event) {
        if (!minimapDrag || !minimapPanel) return;
        minimapPanel.dataset.positionMode = "custom";
        applyMinimapPosition(event.clientX - minimapDrag.offsetX, event.clientY - minimapDrag.offsetY);
      }

      function stopMinimapDrag(event) {
        if (!minimapDrag || !minimapPanel || !minimapDragHandle) return;
        minimapDrag = null;
        minimapPanel.classList.remove("is-dragging");
        if (typeof event.pointerId === "number") {
          minimapDragHandle.releasePointerCapture(event.pointerId);
        }
      }

      function suppressZoomAreaClick() {
        suppressNextZoomAreaClick = true;
        window.setTimeout(() => {
          suppressNextZoomAreaClick = false;
        }, 100);
      }

      function cancelPanDrag(suppressClick = false) {
        if (
          panDrag
          && typeof viewport.hasPointerCapture === "function"
          && viewport.hasPointerCapture(panDrag.pointerId)
        ) {
          viewport.releasePointerCapture(panDrag.pointerId);
        }
        if (suppressClick && panDrag && panDrag.active) suppressZoomAreaClick();
        panDrag = null;
        viewport.classList.remove("is-panning");
      }

      function startPanDrag(event) {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        const target = event.target instanceof Element ? event.target : null;
        if (target?.closest("a, button, input, select, textarea, iframe, audio, video, [contenteditable='true']")) return;
        panDrag = {
          pointerId: event.pointerId,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startScrollLeft: viewport.scrollLeft,
          startScrollTop: viewport.scrollTop,
          active: false,
        };
      }

      function movePanDrag(event) {
        if (!panDrag || event.pointerId !== panDrag.pointerId) return;
        if ((event.buttons & 1) === 0) {
          cancelPanDrag();
          return;
        }
        const deltaX = event.clientX - panDrag.startClientX;
        const deltaY = event.clientY - panDrag.startClientY;
        if (!panDrag.active && Math.hypot(deltaX, deltaY) < 6) return;
        if (!panDrag.active) {
          panDrag.active = true;
          viewport.classList.add("is-panning");
          if (typeof viewport.setPointerCapture === "function") {
            viewport.setPointerCapture(event.pointerId);
          }
        }
        viewport.scrollLeft = panDrag.startScrollLeft - deltaX;
        viewport.scrollTop = panDrag.startScrollTop - deltaY;
        event.preventDefault();
      }

      function finishPanDrag(event) {
        if (!panDrag || event.pointerId !== panDrag.pointerId) return;
        const wasActive = panDrag.active;
        cancelPanDrag(wasActive);
        if (wasActive) event.preventDefault();
      }

      function cancelZoomAreaDrag(suppressClick = false) {
        if (
          zoomAreaDrag
          && typeof viewport.hasPointerCapture === "function"
          && viewport.hasPointerCapture(zoomAreaDrag.pointerId)
        ) {
          viewport.releasePointerCapture(zoomAreaDrag.pointerId);
        }
        if (suppressClick && zoomAreaDrag) suppressZoomAreaClick();
        zoomAreaDrag = null;
        if (zoomAreaSelection) zoomAreaSelection.hidden = true;
        if (zoomAreaHint) zoomAreaHint.hidden = true;
        viewport.classList.remove("is-zoom-area-selecting");
      }

      function getZoomAreaPoint(event) {
        const rect = viewport.getBoundingClientRect();
        return {
          x: clamp(event.clientX, rect.left, rect.right),
          y: clamp(event.clientY, rect.top, rect.bottom),
        };
      }

      function renderZoomAreaSelection(endPoint) {
        if (!zoomAreaSelection || !zoomAreaDrag || !zoomAreaDrag.active) return null;
        const left = Math.min(zoomAreaDrag.startX, endPoint.x);
        const top = Math.min(zoomAreaDrag.startY, endPoint.y);
        const width = Math.abs(endPoint.x - zoomAreaDrag.startX);
        const height = Math.abs(endPoint.y - zoomAreaDrag.startY);
        zoomAreaSelection.hidden = false;
        zoomAreaSelection.style.left = left + "px";
        zoomAreaSelection.style.top = top + "px";
        zoomAreaSelection.style.width = width + "px";
        zoomAreaSelection.style.height = height + "px";
        return { left, top, width, height };
      }

      function startZoomAreaSelection(event) {
        if (event.pointerType !== "mouse" || event.button !== 2) return;
        const target = event.target instanceof Element ? event.target : null;
        if (target?.closest("a, button, input, select, textarea, iframe, audio, video, [contenteditable='true']")) return;
        const point = getZoomAreaPoint(event);
        cancelledZoomAreaPointerId = null;
        zoomAreaDrag = {
          pointerId: event.pointerId,
          startX: point.x,
          startY: point.y,
          active: false,
        };
        if (zoomAreaHint) {
          const viewportRect = viewport.getBoundingClientRect();
          zoomAreaHint.style.left = viewportRect.left + viewportRect.width / 2 + "px";
          zoomAreaHint.style.top = viewportRect.top + 12 + "px";
          zoomAreaHint.hidden = false;
        }
      }

      function moveZoomAreaSelection(event) {
        if (!zoomAreaDrag || event.pointerId !== zoomAreaDrag.pointerId) return;
        if ((event.buttons & 2) === 0) {
          cancelZoomAreaDrag();
          return;
        }
        const point = getZoomAreaPoint(event);
        if (
          !zoomAreaDrag.active
          && Math.hypot(point.x - zoomAreaDrag.startX, point.y - zoomAreaDrag.startY) < 6
        ) return;
        if (!zoomAreaDrag.active) {
          zoomAreaDrag.active = true;
          viewport.classList.add("is-zoom-area-selecting");
          if (typeof viewport.setPointerCapture === "function") {
            viewport.setPointerCapture(event.pointerId);
          }
        }
        renderZoomAreaSelection(point);
        event.preventDefault();
      }

      function finishZoomAreaSelection(event) {
        if (!zoomAreaDrag) {
          if (event.pointerId === cancelledZoomAreaPointerId) {
            cancelledZoomAreaPointerId = null;
            suppressZoomAreaClick();
          }
          return;
        }
        if (event.pointerId !== zoomAreaDrag.pointerId) return;
        if (!zoomAreaDrag.active) {
          cancelZoomAreaDrag();
          return;
        }
        const selection = renderZoomAreaSelection(getZoomAreaPoint(event));
        const canvasRect = canvas.getBoundingClientRect();
        const scaleBeforeZoom = currentScale;
        const selectedCanvasArea = selection && selection.width >= 12 && selection.height >= 12
          ? {
            centerX: (selection.left + selection.width / 2 - canvasRect.left) / scaleBeforeZoom,
            centerY: (selection.top + selection.height / 2 - canvasRect.top) / scaleBeforeZoom,
            width: selection.width / scaleBeforeZoom,
            height: selection.height / scaleBeforeZoom,
          }
          : null;
        cancelZoomAreaDrag(true);
        if (selectedCanvasArea === null) return;

        const availableWidth = Math.max(100, viewport.clientWidth - 48);
        const availableHeight = Math.max(100, viewport.clientHeight - 48);
        currentScale = clamp(
          Math.min(
            availableWidth / selectedCanvasArea.width,
            availableHeight / selectedCanvasArea.height,
          ),
          0.2,
          4,
        );
        setCssProps(canvas, { transform: "scale(" + currentScale + ")" });
        drawEdges();
        scrollViewportToCanvasPoint(
          selectedCanvasArea.centerX,
          selectedCanvasArea.centerY,
          "auto",
        );
        event.preventDefault();
      }

      window.zoomBy = function(factor) {
        cancelZoomAreaDrag();
        currentScale = Math.max(0.2, Math.min(4, currentScale * factor));
        setCssProps(canvas, { transform: "scale(" + currentScale + ")" });
        drawEdges();
        updateMinimapViewport();
      };

      function zoomAtPoint(clientX, clientY, factor) {
        const canvasRect = canvas.getBoundingClientRect();
        const mouseXInCanvasVisual = clientX - canvasRect.left;
        const mouseYInCanvasVisual = clientY - canvasRect.top;
        const previousScale = currentScale;
        const newScale = clamp(previousScale * factor, 0.2, 4);
        if (newScale === previousScale) return;
        const ratio = newScale / previousScale;

        cancelZoomAreaDrag();
        currentScale = newScale;
        setCssProps(canvas, { transform: "scale(" + currentScale + ")" });

        viewport.scrollLeft += mouseXInCanvasVisual * (ratio - 1);
        viewport.scrollTop += mouseYInCanvasVisual * (ratio - 1);

        drawEdges();
        updateMinimapViewport();
      }
      window.zoomAtPoint = zoomAtPoint;

      window.resetZoom = function() {
        cancelZoomAreaDrag();
        const fitPadding = 32;
        const fitBounds = getFitNodeBounds();
        const viewportTop = viewport.getBoundingClientRect().top;
        const topInset = toolbar ? Math.max(0, toolbar.getBoundingClientRect().bottom - viewportTop) : 0;
        const availableWidth = Math.max(100, viewport.clientWidth - fitPadding * 2);
        const availableHeight = Math.max(100, viewport.clientHeight - topInset - fitPadding * 2);
        const scaleX = availableWidth / Math.max(1, fitBounds.width);
        const scaleY = availableHeight / Math.max(1, fitBounds.height);
        currentScale = Math.min(scaleX, scaleY, 1);
        setCssProps(canvas, { transform: "scale(" + currentScale + ")" });
        drawEdges();
        scrollViewportToCanvasPoint(
          fitBounds.left + fitBounds.width / 2,
          fitBounds.top + fitBounds.height / 2,
          "auto",
        );
        if (topInset > 0) viewport.scrollTop = Math.max(0, viewport.scrollTop - topInset / 2);
      };

      function syncLinkOfflineState() {
        const offline = typeof navigator !== "undefined" && navigator.onLine === false;
        document.querySelectorAll(".link-preview").forEach((preview) => {
          const offlineNote = preview.querySelector("[data-link-offline]");
          const blockedNote = preview.querySelector("[data-link-blocked]");
          const frame = preview.querySelector(".link-preview-frame");
          const iframe = preview.querySelector("iframe");
          if (offlineNote) offlineNote.hidden = !offline;
          if (blockedNote) blockedNote.hidden = true;
          if (frame) frame.hidden = offline;
          if (iframe && !iframe.dataset.linkFallbackBound) {
            iframe.dataset.linkFallbackBound = "true";
            iframe.addEventListener("load", () => {
              iframe.dataset.linkLoaded = "true";
              if (blockedNote) blockedNote.hidden = true;
            });
            window.setTimeout(() => {
              const currentlyOffline = typeof navigator !== "undefined" && navigator.onLine === false;
              if (!currentlyOffline && iframe.dataset.linkLoaded !== "true") {
                if (blockedNote) blockedNote.hidden = false;
                if (frame) frame.hidden = true;
              }
            }, 4000);
          }
        });
      }

`;
}
