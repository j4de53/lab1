let module;

createModule().then(mod => {
    module = mod;
    document.getElementById('computeBtn').disabled = false;
    document.getElementById('avgBtn').disabled = false;
    updateFormulaDisplay();
    updateRangeAndHint();
    console.log("Модуль WebAssembly загружен");
}).catch(err => {
    console.error('Ошибка загрузки модуля:', err);
    alert('Не удалось загрузить WebAssembly модуль. Проверьте консоль.');
});

// Форматирует время, полученное в микросекундах
function formatTime(us) {
    if (us < 0.001) {
        return "< 0.001 мкс";
    }
    if (us < 1) {
        return us.toFixed(3) + " мкс";
    }
    if (us < 1000) {
        return us.toFixed(3) + " мкс";
    }
    if (us < 1_000_000) {
        return (us / 1000).toFixed(3) + " мс";
    }
    return (us / 1_000_000).toFixed(3) + " с";
}

function updateFormulaDisplay() {
    const choice = document.getElementById('formulaChoice').value;
    const display = document.getElementById('formulaDisplay');
    if (choice === '11') {
        display.innerText = 
`F(1) = 1
F(n) = n + F(n-1)  (n чётное)
F(n) = 2*F(n-1) + F(n-2)  (n нечётное, n>1)`;
    } else {
        display.innerText = 
`F(n) = 1, n < 3
F(n) = F(n-1) + F(n-2)  (n нечётное, n>2)
F(n) = Σ_{i=1}^{n-1} F(i)  (n чётное, n>2)`;
    }
    updateRangeAndHint();
}

function updateRangeAndHint() {
    const choice = document.getElementById('formulaChoice').value;
    const nInput = document.getElementById('nValue');
    const hintSpan = document.getElementById('nHint');
    let maxVal, hintText;

    if (choice === '11') {
        maxVal = 60;
        hintText = '(допустимые значения: 1 … 60)';
    } else {
        maxVal = 30;
        hintText = '(допустимые значения: 1 … 30)';
    }
    nInput.max = maxVal;
    hintSpan.innerText = hintText;
    let current = parseInt(nInput.value, 10);
    if (current > maxVal) {
        nInput.value = maxVal;
    }
}

function computeFormula() {
    if (!module) return;
    const choice = document.getElementById('formulaChoice').value;
    const nInput = document.getElementById('nValue');
    let n = parseInt(nInput.value, 10);
    const maxVal = choice === '11' ? 60 : 30;

    if (isNaN(n) || n < 1 || n > maxVal) {
        alert(`n должно быть от 1 до ${maxVal}`);
        return;
    }

    module._resetCallCount();
    module._resetIterCount();

    let recFunc, iterFunc;
    if (choice === '11') {
        recFunc = module._f11_rec;
        iterFunc = module._f11_iter;
    } else {
        recFunc = module._f4_rec;
        iterFunc = module._f4_iter;
    }

    const startRec = performance.now();
    const recResult = recFunc(n);
    const recTimeUs = (performance.now() - startRec) * 1000;

    const startIter = performance.now();
    const iterResult = iterFunc(n);
    const iterTimeUs = (performance.now() - startIter) * 1000;

    const callCount = module._getCallCount();
    const iterCount = module._getIterCount();

    document.getElementById('recResult').innerText = recResult;
    document.getElementById('iterResult').innerText = iterResult;
    document.getElementById('callCount').innerText = callCount;
    document.getElementById('iterCount').innerText = iterCount;
    document.getElementById('recTime').innerHTML = formatTime(recTimeUs);
    document.getElementById('iterTime').innerHTML = formatTime(iterTimeUs);
}

function computeAverage() {
    if (!module) return;
    const input = document.getElementById('sequenceInput').value;
    if (!input.trim()) {
        alert('Введите последовательность');
        return;
    }
    const start = performance.now();
    const avg = module.ccall('computeAverage', 'number', ['string'], [input]);
    const timeUs = (performance.now() - start) * 1000;
    document.getElementById('avgResult').innerText = avg.toFixed(4);
    document.getElementById('avgTime').innerHTML = formatTime(timeUs);
}

document.getElementById('formulaChoice').addEventListener('change', () => {
    updateFormulaDisplay();
    updateRangeAndHint();
});
document.getElementById('computeBtn').addEventListener('click', computeFormula);
document.getElementById('avgBtn').addEventListener('click', computeAverage);

document.getElementById('computeBtn').disabled = true;
document.getElementById('avgBtn').disabled = true;