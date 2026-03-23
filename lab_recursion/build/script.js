let module;

// Дожидаемся загрузки модуля WebAssembly
createModule().then(mod => {
    module = mod;
    // После загрузки можно активировать кнопки
    document.getElementById('computeBtn').disabled = false;
    document.getElementById('avgBtn').disabled = false;
    // Устанавливаем текст формул
    updateFormulaDisplay();
}).catch(err => {
    console.error('Ошибка загрузки модуля:', err);
    alert('Не удалось загрузить WebAssembly модуль. Проверьте консоль.');
});

// Обновление текста формулы при выборе варианта
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
`F(n) = 1, n ≤ 1
F(n) = 4*n + F(n-1) - F(2), n нечётное, n>1
F(n) = 3*F(n-1), n чётное, n>1`;
    }
}

// Вычисление формулы
async function computeFormula() {
    if (!module) return;
    const n = parseInt(document.getElementById('nValue').value, 10);
    if (isNaN(n) || n < 1) {
        alert('n должно быть >= 1');
        return;
    }

    const choice = document.getElementById('formulaChoice').value;

    // Сброс счётчика
    module._resetCallCount();

    // Выбор функций
    let recFunc, iterFunc;
    if (choice === '11') {
        recFunc = module._f11_rec;
        iterFunc = module._f11_iter;
    } else {
        recFunc = module._f6_rec;
        iterFunc = module._f6_iter;
    }

    // Замер рекурсии
    const startRec = performance.now();
    const recResult = recFunc(n);
    const endRec = performance.now();
    const recTimeMicro = (endRec - startRec) * 1000; // в микросекундах

    // Замер итерации
    const startIter = performance.now();
    const iterResult = iterFunc(n);
    const endIter = performance.now();
    const iterTimeMicro = (endIter - startIter) * 1000;

    const callCount = module._getCallCount();

    document.getElementById('recResult').innerText = recResult;
    document.getElementById('iterResult').innerText = iterResult;
    document.getElementById('callCount').innerText = callCount;
    document.getElementById('recTime').innerText = recTimeMicro.toFixed(3);
    document.getElementById('iterTime').innerText = iterTimeMicro.toFixed(3);
}

// Вычисление среднего
function computeAverage() {
    if (!module) return;
    const input = document.getElementById('sequenceInput').value;
    if (!input.trim()) {
        alert('Введите последовательность');
        return;
    }
    // Передаём строку в C++ функцию
    const avg = module._computeAverage(input);
    document.getElementById('avgResult').innerText = avg.toFixed(4);
}

// Слушатели событий
document.getElementById('formulaChoice').addEventListener('change', updateFormulaDisplay);
document.getElementById('computeBtn').addEventListener('click', computeFormula);
document.getElementById('avgBtn').addEventListener('click', computeAverage);

// Изначально кнопки неактивны до загрузки модуля
document.getElementById('computeBtn').disabled = true;
document.getElementById('avgBtn').disabled = true;