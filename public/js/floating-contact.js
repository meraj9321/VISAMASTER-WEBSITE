document.addEventListener("DOMContentLoaded", function () {
  const widget = document.getElementById("floatingContact");

  if (!widget) return;

  let isDragging = false;
  let hasMoved = false;
  let suppressClick = false;

  let startX = 0;
  let startY = 0;

  let initialLeft = 0;
  let initialTop = 0;

  const threshold = 5;

  // START DRAGGING
  widget.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const rect = widget.getBoundingClientRect();

    isDragging = true;
    hasMoved = false;

    startX = e.clientX;
    startY = e.clientY;

    initialLeft = rect.left;
    initialTop = rect.top;

    widget.classList.add("dragging");
  });

  // MOVE WIDGET
  document.addEventListener("pointermove", function (e) {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    if (
      !hasMoved &&
      Math.abs(deltaX) < threshold &&
      Math.abs(deltaY) < threshold
    ) {
      return;
    }

    hasMoved = true;

    const maxLeft = window.innerWidth - widget.offsetWidth;
    const maxTop = window.innerHeight - widget.offsetHeight;

    let newLeft = initialLeft + deltaX;
    let newTop = initialTop + deltaY;

    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    widget.style.left = newLeft + "px";
    widget.style.top = newTop + "px";
    widget.style.right = "auto";
  });

  // STOP DRAGGING
  function stopDragging() {
    if (!isDragging) return;

    isDragging = false;

    widget.classList.remove("dragging");

    if (hasMoved) {
      suppressClick = true;
    }

    hasMoved = false;
  }

  document.addEventListener("pointerup", stopDragging);
  document.addEventListener("pointercancel", stopDragging);

  // PREVENT ACCIDENTAL CLICK AFTER DRAGGING
  widget.addEventListener(
    "click",
    function (e) {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();

        suppressClick = false;
      }
    },
    true,
  );
});
