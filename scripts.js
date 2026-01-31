document.addEventListener('DOMContentLoaded', function () {
    // Add better logging and robust fallback for broken images
    document.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('load', function () {
            // ensure image is visible and remove any previous fallback message
            img.style.display = '';
            if (img.nextElementSibling && img.nextElementSibling.classList && img.nextElementSibling.classList.contains('broken-image')) {
                img.nextElementSibling.remove();
            }
            console.info('Image loaded:', img.src, 'naturalSize:', img.naturalWidth + 'x' + img.naturalHeight);
        });

        img.addEventListener('error', function () {
            console.error('Image failed to load:', img.src);
            // hide the broken image and show a small placeholder box
            img.style.display = 'none';
            if (!img.nextElementSibling || !img.nextElementSibling.classList || !img.nextElementSibling.classList.contains('broken-image')) {
                var msg = document.createElement('div');
                msg.className = 'broken-image';
                msg.textContent = 'Ảnh không tải được';
                img.parentNode.insertBefore(msg, img.nextSibling);
            }
        });
    });

    // If users add files while the page is open, attempt a small number of reloads (cache-busting)
    var RELOAD_DELAYS = [1000, 3000, 7000]; // ms

    function tryReload(img, attempt) {
        if (attempt > RELOAD_DELAYS.length) return;
        // small backoff before retry
        setTimeout(function () {
            var base = img.getAttribute('src').split('?')[0];
            // append cache-buster so the browser re-requests the file
            img.setAttribute('src', base + '?_=' + Date.now());
            console.info('Retrying image load:', img.src, 'attempt', attempt);
        }, RELOAD_DELAYS[attempt - 1]);
    }

    document.querySelectorAll('img').forEach(function (img) {
        var shouldRetry = false;
        if (img.nextElementSibling && img.nextElementSibling.classList && img.nextElementSibling.classList.contains('broken-image')) {
            shouldRetry = true;
        }
        // also if image hasn't loaded and naturalWidth === 0
        if (img.complete && img.naturalWidth === 0) {
            shouldRetry = true;
        }
        if (shouldRetry) {
            // try up to RELOAD_DELAYS.length times
            for (var i = 1; i <= RELOAD_DELAYS.length; i++) {
                tryReload(img, i);
            }
        }
    });
});