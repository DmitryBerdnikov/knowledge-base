const fs = require('fs');
const path = require('path');

/**
 * Генерирует интерфейсы TypeScript с заданной структурой и сохраняет в файл.
 *
 * @param {number} count - Количество интерфейсов для генерации.
 * @param {string} outputPath - Путь, куда сохранить сгенерированный файл.
 */
function generateInterfaces(count, outputPath) {
    // Проверяем, что count - это положительное число
    if (typeof count !== 'number' || count <= 0) {
        throw new Error('Число интерфейсов должно быть положительным.');
    }

    // Строка для хранения сгенерированного кода
    let code = '';

    // Генерация интерфейсов
    for (let i = 1; i <= count; i++) {
        code += `export interface A${i} {\n`;
        code += `\ttypeAValue1: 1;\n`;
        code += `\ttypeAValue12: '${randomString()}';\n`;
        code += `\ttypeAValue13: ${randomNumber(1, 100)};\n`;
        code += `\ttypeAValue14: {\n`;
        code += `\t\ttypeAValue11: '${randomString()}';\n`;
        code += `\t\ttypeAValue12: {\n`;
        code += `\t\t\ttypeAValue13: '${randomString()}';\n`;
        code += `\t\t\ttypeAValue14: {\n`;
        code += `\t\t\t\ttypeAValue13: '${randomString()}';\n`;
        code += `\t\t\t\ttypeAValue14: ${randomNumber(1, 100)};\n`;
        code += `\t\t\t}\n`;
        code += `\t\t}\n`;
        code += `\t}\n`;
        code += `}\n\n`;

        code += `export interface B${i} {\n`;
        code += `\ttypeBValue1: 1;\n`;
        code += `\ttypeBValue2: '${randomString()}';\n`;
        code += `\ttypeBValue3: ${randomNumber(1, 100)};\n`;
        code += `\ttypeBValue4: {\n`;
        code += `\t\ttypeBValue1: '${randomString()}';\n`;
        code += `\t\ttypeBValue2: ${randomNumber(1, 100)};\n`;
        code += `\t}\n`;
        code += `}\n\n`;
        
        code += `export interface C${i} extends A${i}, B${i} {}\n\n`;
    }

    // Формируем полный путь к файлу
    const fullPath = path.resolve(outputPath);

    // Сохраняем код в файл
    fs.writeFile(fullPath, code, (err) => {
        if (err) {
            console.error('Ошибка при записи файла:', err);
        } else {
            console.log(`Файл успешно создан: ${fullPath}`);
        }
    });
}

// Генерация случайной строки
function randomString(length = 5) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Генерация случайного числа в заданном диапазоне
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Пример вызова функции
const numberOfInterfaces = 10000; // количество интерфейсов для генерации
const filePath = './generated-interfaces.ts'; // путь к файлу

generateInterfaces(numberOfInterfaces, filePath);