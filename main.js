// ==UserScript==
// @name         Universal MathJax typesetting
// @version      1.0
// @description  Load MathJax and typeset on DOM mutations
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Inject MathJax configuration
    console.log("set up mathjax");
    var mjConfigScript = document.createElement('script');
    mjConfigScript.type = 'text/javascript';
    mjConfigScript.text = `
        MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\\\(', '\\\\)']]
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
    document.head.appendChild(mjScript);

    // When MathJax is loaded, set up the MutationObserver
    console.log("set up mutation observer");
    mjScript.onload = function() {
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
                // Disconnect observer to prevent infinite loops
                observer.disconnect();
                // Typeset new content
                MathJax.typeset();
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
})();
