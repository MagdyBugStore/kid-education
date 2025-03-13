// code-highlighter.js

(function () {

    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .code-container {
                position: relative;
                background-color: #1e1e1e;
                color: #d4d4d4;
                border-radius: 8px;
                font-family: monospace;
                white-space: pre-wrap;
                overflow-x: auto;
            }

            .code-container-input {
                padding-right: 5px;
                width: 3ch;
                height: 20px;
                font-size: 12px;
                border: 1px solid #ccc;
                border-radius: 4px;
                background-color: #333;
                color: #d4d4d4;
                
                transform: translateY(9px); /* Move the textarea down by 5 pixels */
                display: inline-block;
            }

            .keyword {
                color: #569cd6;
            }

            .string {
                color: #ce9178;
            }

            .number {
                color: #b5cea8;
            }

            .function {
                color: #dcdcaa;
            }

            .variable {
                color: #9cdcfe;
            }

            .regex {
                color: #4ec9b0;
            }

            .run-button {
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: #4CAF50;
                border: none;
                color: white;
                padding: 8px 16px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 14px;
                border-radius: 4px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    function highlightCode(codeContainer) {
        let code = codeContainer.innerText;
        const escapeHTML = text => text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const tokens = [];
        let currentIndex = 0;
        let indentLevel = 0;
        let formattedCode = "";

        const patterns = [
            { regex: /\b(function|let|const|if|else|for|while|return|true|false|null|undefined|break|continue)\b/g, class: "keyword" },
            { regex: /("[^"]*"|'[^']*')/g, class: "string" },
            { regex: /\b\d+\b/g, class: "number" },
            { regex: /\b([a-zA-Z_$][\w$]*)\s*(?=\()/g, class: "function" },
            { regex: /\b([a-zA-Z_$][\w$]*)\b(?!\s*\()/g, class: "variable" },
            { regex: /\/[^\n]*?\//g, class: "regex" },
            { regex: /\s+/g, class: "whitespace" },
            { regex: /\{/g, class: "braceOpen" },
            { regex: /\}/g, class: "braceClose" },
            { regex: /\(/g, class: "parenOpen" },
            { regex: /\)/g, class: "parenClose" },
            { regex: /\;/g, class: "semicolon" }
        ];
        while (currentIndex < code.length) {
            let matchFound = false;
            for (const pattern of patterns) {
                pattern.regex.lastIndex = currentIndex;
                const match = pattern.regex.exec(code);
                if (match && match.index === currentIndex) {
                    if (match[0] === "{") {
                        indentLevel++;
                    } else if (match[0] === "}") {
                        indentLevel = Math.max(0, indentLevel - 1);
                    }
                    if (pattern.class === "whitespace") {
                        if (match[0].includes("\n")) {
                            formattedCode += match[0];
                        } else {
                            formattedCode += match[0];
                        }
                    } else if (pattern.class === "input") {
                        formattedCode += match[0];
                    } else {
                        formattedCode += `<span class="${pattern.class}">${escapeHTML(match[0])}</span>`;
                    }
                    currentIndex += match[0].length;
                    matchFound = true;
                    break;
                }
            }
            if (!matchFound) {
                formattedCode += escapeHTML(code[currentIndex]);
                currentIndex++;
            }
        }
        let inputIndex = 0;
        let newFormat = formattedCode
        codeContainer.innerHTML = newFormat.replaceAll(/\[\*\]/g, () => {
            const inputHtml = `<textarea class="code-container-input" id="input${inputIndex}" placeholder="..." oninput="window.codeHighlighter.adjustInputWidth(this)"></textarea>`;
            inputIndex++;
            return inputHtml;
        });

        const runButton = document.createElement('button');
        runButton.textContent = 'Run';
        runButton.className = 'run-button';
        runButton.addEventListener('click', () => runCode(codeContainer, code));
        codeContainer.appendChild(runButton);
    }

    function adjustInputWidth(input) {
        const minWidth = 3;
        const inputWidth = Math.max(minWidth, input.value.length + 1);
        input.style.width = inputWidth + "ch";
    }

    function applyHighlighting() {
        document.querySelectorAll(".code-container code").forEach(highlightCode);
    }
    function runCode(codeContainer, code) {
        const inputs = codeContainer.querySelectorAll('.code-container-input');
        let inputIndex = 0;
        code = code.replaceAll(/\[\*\]/g, () => {
            if (inputs[inputIndex]) {
                const inputValue = inputs[inputIndex].value;
                inputIndex++;
                return inputValue;
            } else {
                return '';
            }
        }).replace("Run", "");

        try {
            // Remove existing script if it exists
            let existingScript = document.querySelector('#dynamicScript');
            if (existingScript) {
                existingScript.remove();
            }

            // Create a new script element and append it
            const script = document.createElement('script');
            script.textContent = code;
            script.id = 'dynamicScript';
            document.body.appendChild(script);
        } catch (error) {
            console.error("Error executing code:", error);
            alert("Error executing code. Check console for details.");
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        addStyles();
        applyHighlighting();
    });

    window.codeHighlighter = {
        adjustInputWidth: adjustInputWidth,
        applyHighlighting: applyHighlighting
    };
})();