const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Выполняет команду tsc --diagnostics 10 раз и сохраняет все параметры в файл.
 *
 * @param {string} outputPath - Путь к файлу, куда сохранить вывод.
 */
async function exportTscDiagnostics(outputPath) {
    const fullPath = path.resolve(outputPath);
    const iterations = 10; // Теперь выполняется 10 раз
    const diagnosticsData = [];

    for (let i = 0; i < iterations; i++) {
        const output = await runTscDiagnostics();
        const parsedData = parseDiagnostics(output);
        diagnosticsData.push(parsedData);
    }

    const resultOutput = diagnosticsData
        .map((data, index) => 
            `Run ${index + 1}:\n` +
            `  Total Time: ${data.totalTime} ms\n` +
            `  Memory Used: ${data.memory} MB\n` +
            `  Files: ${data.files}\n` +
            `  Lines: ${data.lines}\n` +
            `  Types: ${data.types}\n` +
            `  Symbols: ${data.symbols}\n` +
            `  Instantiations: ${data.instantiations}\n` +
            `  I/O Read: ${data.ioRead}\n` +
            `  Identifiers: ${data.identifiers}\n` +
            `  Parse Time: ${data.parseTime}\n` +
            `  Bind Time: ${data.bindTime}\n` +
            `  Check Time: ${data.checkTime}\n` +
            `  Emit Time: ${data.emitTime}\n`
        )
        .join('\n');

    // Рассчет средних значений
    const averages = calculateAverages(diagnosticsData);

    const averagesOutput = 
        `\nAverage Metrics & types:\n` +
        `  Total Time: ${averages.totalTime} ms\n` +
        `  Memory Used: ${averages.memory} MB\n` +
        `  Files: ${averages.files}\n` +
        `  Lines: ${averages.lines}\n` +
        `  Types: ${averages.types}\n` +
        `  Symbols: ${averages.symbols}\n` +
        `  Instantiations: ${averages.instantiations}\n` +
        `  I/O Read: ${averages.ioRead}\n` +
        `  Identifiers: ${averages.identifiers}\n` +
        `  Parse Time: ${averages.parseTime}\n` +
        `  Bind Time: ${averages.bindTime}\n` +
        `  Check Time: ${averages.checkTime}\n` +
        `  Emit Time: ${averages.emitTime}\n`;

    fs.writeFile(fullPath, resultOutput + averagesOutput, (err) => {
        if (err) {
            console.error(`Ошибка при записи в файл: ${err}`);
            return;
        }
        console.log(`Вывод сохранен в файл: ${fullPath}`);
    });
}

/**
 * Запускает команду tsc --diagnostics и возвращает вывод.
 * @returns {Promise<string>} - Вывод команды.
 */
function runTscDiagnostics() {
    return new Promise((resolve, reject) => {
        exec('tsc ./src/types.ts --diagnostics --noEmit', (error, stdout, stderr) => {
            if (error) {
                console.error(`Ошибка при выполнении команды: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                console.error(`Ошибка выполнения: ${stderr}`);
                return reject(new Error(stderr));
            }
            resolve(stdout);
        });
    });
}

/**
 * Парсит вывод диагностики и извлекает необходимые метрики.
 * @param {string} output - Вывод команды.
 * @returns {Object} - Объект, содержащий различные метрики.
 */
function parseDiagnostics(output) {
    const lines = output.split('\n');
    let totalTime = 0;
    let memory = 0;
    let files = 0;
    let linesCount = 0;
    let typesCount = 0;
    let identifiers = 0;
    let symbols = 0;
    let instantiations = 0;
    let ioRead = 0;
    let ioWrite = 0;
    let parseTime = 0;
    let bindTime = 0;
    let checkTime = 0;
    let emitTime = 0;

    lines.forEach((line) => {
        if (line.includes('Total time:')) {
            totalTime = parseFloat(line.split(':')[1].trim());
        } else if (line.includes('Memory used:')) {
            memory = parseFloat(line.split(':')[1].trim().split(' ')[0]);
        } else if (line.includes('Identifiers:')) {
            identifiers = parseFloat(line.split(':')[1].trim().split(' ')[0]);
        } else if (line.includes('Files:')) {
            files = parseInt(line.split(':')[1].trim());
        } else if (line.includes('Symbols:')) {
            symbols = parseInt(line.split(':')[1].trim());
        } else if (line.includes('Instantiations:')) {
            instantiations = parseInt(line.split(':')[1].trim());
        } else if (line.includes('I/O read:')) {
            ioRead = parseFloat(line.split(':')[1].trim());
        } else if (line.includes('I/O write:')) {
            ioWrite = parseFloat(line.split(':')[1].trim());
        } else if (line.includes('Parse time:')) {
            parseTime = parseFloat(line.split(':')[1].trim());
        } else if (line.includes('Bind time:')) {
            bindTime = parseFloat(line.split(':')[1].trim());
        } else if (line.includes('Check time:')) {
            checkTime = parseFloat(line.split(':')[1].trim());
        } else if (line.includes('Emit time:')) {
            emitTime = parseFloat(line.split(':')[1].trim());
        } else if (line.includes('Lines:')) {
            linesCount = parseInt(line.split(':')[1].trim());
        } else if (line.includes('Types:')) {
            typesCount = parseInt(line.split(':')[1].trim());
        }
    });

    return {
        totalTime,
        memory,
        files,
        lines: linesCount,
        identifiers,
        types: typesCount,
        symbols,
        instantiations,
        ioRead,
        ioWrite,
        parseTime,
        bindTime,
        checkTime,
        emitTime,
    };
}

/**
 * Рассчитывает средние значения всех показателей.
 * @param {Array} diagnosticsData - Массив данных диагностики.
 * @returns {Object} - Объект со средними значениями.
 */
function calculateAverages(diagnosticsData) {
    const metricsCount = diagnosticsData.length;

    const aggregatedData = diagnosticsData.reduce((acc, data) => {
        acc.totalTime += data.totalTime;
        acc.memory += data.memory;
        acc.files += data.files;
        acc.lines += data.lines;
        acc.identifiers += data.identifiers;
        acc.types += data.types;
        acc.symbols += data.symbols;
        acc.instantiations += data.instantiations;
        acc.ioRead += data.ioRead;
        acc.ioWrite += data.ioWrite;
        acc.parseTime += data.parseTime;
        acc.bindTime += data.bindTime;
        acc.checkTime += data.checkTime;
        acc.emitTime += data.emitTime;
        return acc;
    }, {
        totalTime: 0,
        memory: 0,
        files: 0,
        lines: 0,
        identifiers: 0,
        types: 0,
        symbols: 0,
        instantiations: 0,
        ioRead: 0,
        ioWrite: 0,
        parseTime: 0,
        bindTime: 0,
        checkTime: 0,
        emitTime: 0
    });

    return {
        totalTime: (aggregatedData.totalTime / metricsCount).toFixed(2),
        memory: (aggregatedData.memory / metricsCount).toFixed(2),
        files: Math.round(aggregatedData.files / metricsCount),
        lines: Math.round(aggregatedData.lines / metricsCount),
        identifiers: Math.round(aggregatedData.identifiers / metricsCount),
        types: Math.round(aggregatedData.types / metricsCount),
        symbols: Math.round(aggregatedData.symbols / metricsCount),
        instantiations: Math.round(aggregatedData.instantiations / metricsCount),
        ioRead: (aggregatedData.ioRead / metricsCount).toFixed(2),
        ioWrite: (aggregatedData.ioWrite / metricsCount).toFixed(2),
        parseTime: (aggregatedData.parseTime / metricsCount).toFixed(2),
        bindTime: (aggregatedData.bindTime / metricsCount).toFixed(2),
        checkTime: (aggregatedData.checkTime / metricsCount).toFixed(2),
        emitTime: (aggregatedData.emitTime / metricsCount).toFixed(2)
    };
}

// Пример вызова функции
const filePath = './tsc-diagnostics-types.txt' // Укажите желаемый путь для сохранения файла
exportTscDiagnostics(filePath);