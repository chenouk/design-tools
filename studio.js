/* ════════════════════════════════════════════════════════════════
   STUDIO — bottom-sheet behaviour (mobile control panels)
   Turns the control sidebar into a draggable sheet on small screens.
   Looks for .ctrl-panel or .panel and a .sheet-handle inside it.
════════════════════════════════════════════════════════════════ */
(function () {
  const mq = window.matchMedia('(max-width: 900px)');

  function init() {
    const sheet = document.querySelector('.ctrl-panel, .panel');
    if (!sheet || sheet.dataset.sheetBound) return;
    const handle = sheet.querySelector('.sheet-handle');
    if (!handle) return;
    sheet.dataset.sheetBound = '1';

    let open = false;
    let dragging = false;
    let startY = 0;
    let startOpen = false;
    let moved = false;

    function peek() {
      return parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--sheet-peek')
      ) || 56;
    }
    function setOpen(v) {
      open = v;
      sheet.classList.toggle('sheet-open', v);
      sheet.style.transform = '';
    }

    function onDown(e) {
      if (!mq.matches) return;
      dragging = true;
      moved = false;
      startOpen = open;
      startY = (e.touches ? e.touches[0].clientY : e.clientY);
      sheet.classList.add('dragging');
    }
    function onMove(e) {
      if (!dragging) return;
      const y = (e.touches ? e.touches[0].clientY : e.clientY);
      const dy = y - startY;
      if (Math.abs(dy) > 4) moved = true;
      const h = sheet.getBoundingClientRect().height;
      const closedOffset = h - peek();
      // base translate: open=0, closed=closedOffset
      let base = startOpen ? 0 : closedOffset;
      let t = Math.max(0, Math.min(closedOffset, base + dy));
      sheet.style.transform = 'translateY(' + t + 'px)';
      if (e.cancelable) e.preventDefault();
    }
    function onUp() {
      if (!dragging) return;
      dragging = false;
      sheet.classList.remove('dragging');
      const h = sheet.getBoundingClientRect().height;
      const closedOffset = h - peek();
      const m = /translateY\(([-0-9.]+)px\)/.exec(sheet.style.transform);
      if (!moved) { setOpen(!open); return; }   // tap toggles
      const cur = m ? parseFloat(m[1]) : (open ? 0 : closedOffset);
      setOpen(cur < closedOffset * 0.5);
    }

    handle.addEventListener('mousedown', onDown);
    handle.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    // reset when leaving mobile
    mq.addEventListener('change', () => {
      sheet.style.transform = '';
      sheet.classList.remove('sheet-open', 'dragging');
      open = false;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
