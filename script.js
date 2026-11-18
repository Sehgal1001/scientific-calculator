
const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const previousDisplay = document.getElementById("previous");
const modeDisplay = document.getElementById("mode");

let expression = "";
let answer = 0;
let angleMode = "DEG";
let history = [];

const allowedCharacters = /^[0-9+\-*/().%^!a-zA-Z\s]*$/;

function updateDisplay() {
    expressionDisplay.textContent = expression || "Enter calculation";
}

function insertValue(value) {
    expression += value;
    updateDisplay();
}

function clearAll() {
    expression = "";
    resultDisplay.textContent = "0";
    expressionDisplay.textContent = "";
    previousDisplay.textContent = "";
}

function deleteLast() {
    expression = expression.slice(0, -1);
    updateDisplay();
}

function factorial(n) {
    if (!Number.isInteger(n) || n < 0 || n > 170) {
        throw new Error("Invalid factorial");
    }

    let result = 1;

    for (let i = 2; i <= n; i++) {
        result *= i;
    }

    return result;
}

function calculate() {
    try {
        if (!expression) return;

        if (!allowedCharacters.test(expression)) {
            throw new Error("Invalid input");
        }

        let exp = expression;

        // Convert scientific functions
        exp = exp.replace(/pi/g, "PI");
        exp = exp.replace(/\be\b/g, "E");

        exp = exp.replace(/sqrt\(/g, "Math.sqrt(");
        exp = exp.replace(/log\(/g, "Math.log10(");
        exp = exp.replace(/ln\(/g, "Math.log(");

        // Trigonometric calculations
        ["sin", "cos", "tan"].forEach(fn => {
            const regex = new RegExp(fn + "\\(", "g");

            exp = exp.replace(regex, `Math.${fn}(`);
        });

        // Convert degrees into radians
        if (angleMode === "DEG") {
            exp = exp.replace(
                /Math\.(sin|cos|tan)\(/g,
                "Math.$1(Math.PI/180*"
            );
        }

        // Constants
        exp = exp.replace(/PI/g, "Math.PI");
        exp = exp.replace(/\bE\b/g, "Math.E");

        // Power operator
        exp = exp.replace(/\^/g, "**");

        // Factorial
        exp = exp.replace(
            /(\d+(?:\.\d+)?|\([^()]*\))!/g,
            "factorial($1)"
        );

        // Percentage
        exp = exp.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

        // Validate final expression
        const safeExpression = /^[0-9+\-*/().,\sA-Za-z_]*$/;

        if (!safeExpression.test(exp)) {
            throw new Error("Invalid expression");
        }

        const result = Function(
            "factorial",
            `"use strict"; return (${exp})`
        )(factorial);

        if (!Number.isFinite(result)) {
            throw new Error("Math error");
        }

        const formatted = Number(result.toPrecision(12));

        previousDisplay.textContent = expression + " =";
        resultDisplay.textContent = formatted;
        history.unshift({
            calculation: expression,
            result: formatted
        });

        answer = formatted;
        expression = "";
        updateDisplay();
        showHistory();

    } catch (error) {
        resultDisplay.textContent = "Error";
        console.error(error);
    }
}

// Button clicks
document.querySelectorAll("[data-value]").forEach(button => {
    button.addEventListener("click", () => {
        insertValue(button.dataset.value);
    });
});

document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {
        const action = button.dataset.action;

        if (action === "clear") clearAll();
        if (action === "delete") deleteLast();
        if (action === "calculate") calculate();
        if (action === "answer") insertValue(String(answer));
    });
});

// DEG / RAD switching
document.getElementById("angleMode").addEventListener("click", () => {
    angleMode = angleMode === "DEG" ? "RAD" : "DEG";

    document.getElementById("angleMode").textContent = angleMode;
    modeDisplay.textContent = angleMode;
});

// History panel
const historyPanel = document.getElementById("historyPanel");

document.getElementById("historyToggle").addEventListener("click", () => {
    historyPanel.classList.toggle("hidden");
});

document.getElementById("closeHistory").addEventListener("click", () => {
    historyPanel.classList.add("hidden");
});

function showHistory() {
    const historyList = document.getElementById("historyList");

    historyList.innerHTML = "";

    history.forEach(item => {
        const div = document.createElement("div");
        div.className = "history-item";

        const calculation = document.createElement("div");
        calculation.textContent = item.calculation;

        const result = document.createElement("small");
        result.textContent = "= " + item.result;

        div.append(calculation, result);

        div.addEventListener("click", () => {
            expression = item.calculation;
            updateDisplay();
            historyPanel.classList.add("hidden");
        });

        historyList.appendChild(div);
    });
}

document.getElementById("clearHistory").addEventListener("click", () => {
    history = [];
    showHistory();
});

// Keyboard support
document.addEventListener("keydown", event => {
    const key = event.key;

    if (/^[0-9+\-*/().%^!]$/.test(key)) {
        insertValue(key);
    }

    if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    }

    if (key === "Backspace") {
        deleteLast();
    }

    if (key === "Escape") {
        clearAll();
    }
});

updateDisplay();
