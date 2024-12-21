// ==UserScript==
// @name         Universal MathJax typesetting
// @version      1.0
// @description  Load MathJax and typeset on DOM mutations
// @match        *://*/*
// @grant        none
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    console.log("Trying to retrieve a non-empty site nonce for inline scripts");
    let pageNonce = '';
    const scriptsWithNonce = document.querySelectorAll('script[nonce]');
    if (scriptsWithNonce && scriptsWithNonce.length > 0) {
        // Loop over each script tag and grab the first non-empty nonce
        for (const s of scriptsWithNonce) {
            const nonceVal = s.nonce;
            if (nonceVal && nonceVal.trim() !== '') {
                pageNonce = nonceVal;
                console.log("Found non-empty page nonce:", pageNonce);
                break;
            }
        }
        if (!pageNonce) {
            console.warn("All scripts with [nonce] had an empty value");
        }
    } else {
        console.warn("No <script> with a nonce attribute found on this page");
    }

    // Inject MathJax configuration
    console.log("set up mathjax");
    var mjConfigScript = document.createElement('script');
    mjConfigScript.type = 'text/javascript';
    if (pageNonce) {
        mjConfigScript.nonce = pageNonce;
    }
    mjConfigScript.text = `
        MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']]
          }
        };
    `;
    document.head.appendChild(mjConfigScript);

    // Load MathJax script
    console.log("load mathjax");
    var mjScript = document.createElement('script');
    mjScript.id = 'MathJax-script';
    mjScript.async = true;
    mjScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
    if (pageNonce) {
        mjScript.nonce = pageNonce;
    }

    document.head.appendChild(mjScript);

    // When MathJax is loaded, set up the MutationObserver
    console.log("configuring callback to set up mutation observer");

    var moScript = document.createElement('script');
    moScript.async = true;
    if (pageNonce) {
        moScript.nonce = pageNonce;
    }

    //We need to inject it like this because otherwise there's no way to access the MathJax object.
    //https://violentmonkey.github.io/posts/inject-into-context/
    var page_code = `
    var mo_callback = function() {
        console.log("setting up mutation observer");
        console.log("mathjax:");
        console.log(window.MathJax);

        // Set up the MutationObserver
        var observer = null;
        var targetNode = document.body;
        var config = {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
        };
        const callback = (mutationsList, observer) => {
            for (let mutation of mutationsList) {
                console.log("callback called");
                // Disconnect observer to prevent infinite loops
                observer.disconnect();
                // Typeset new content
                window.MathJax.typeset();
                // Reconnect the observer
                observer.observe(targetNode, config);
                break; // Process only one mutation per cycle
            }
        };

        observer = new MutationObserver(callback);

        if (!targetNode || typeof targetNode !== 'object') {
            console.error('Invalid target node for MutationObserver:', targetNode);
            return;
        }

        observer.observe(targetNode, config);
    };
    window.onload = mo_callback;
    `
    moScript.innerHTML = page_code;
    document.head.appendChild(moScript);

})();
