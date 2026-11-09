// Lightweight passcode gate. NOTE: this is friction, not real security —
// the page content is present in the source. It keeps the site off casual view.
(function () {
  var PASS = 'SonomaExcited';
  var KEY = 'sonoma-unlocked';

  function unlock() {
    document.body.classList.remove('locked');
    var gate = document.getElementById('gate');
    if (gate) gate.parentNode.removeChild(gate);
  }

  document.addEventListener('DOMContentLoaded', function () {
    try {
      if (sessionStorage.getItem(KEY) === '1') { unlock(); return; }
    } catch (e) { /* sessionStorage may be unavailable; fall through to prompt */ }

    var input = document.getElementById('gate-input');
    var btn = document.getElementById('gate-btn');
    var err = document.getElementById('gate-err');
    if (!input || !btn) { unlock(); return; } // fail open if markup missing

    function attempt() {
      if (input.value === PASS) {
        try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
        unlock();
      } else {
        if (err) err.textContent = "Hmm, that's not it — try again!";
        input.value = '';
        input.focus();
      }
    }

    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') attempt(); });
    input.focus();
  });
})();
