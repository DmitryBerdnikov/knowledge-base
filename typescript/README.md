# Typescript
[typescript playground](https://www.typescriptlang.org/play) with support different typescript versions

## Examples of non-obvious typescript behavior

<details>
<summary>
  Control-Flow Analysis for Bracketed Element Access
</summary>

[https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#control-flow-analysis-for-bracketed-element-access](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#control-flow-analysis-for-bracketed-element-access)

```typescript
const query: Record<string, string | string[]> = {};

const COUNTRY_KEY = 'country';

if (typeof query[COUNTRY_KEY] === 'string') {
    // There is an error in 4.6 and below, because it's still a string, or a string[]
    const queryCountry: string = query[COUNTRY_KEY];
}
```
</details>

<details>
<summary>Function overloading return type problem</summary>

```typescript
// 1. we want return string type if two arguments are strings
function add(x: string, y: string): string
function add(x: number, y: number): number
function add(x: unknown, y: unknown): unknown {
    // 2. we check case when two arguments are strings
    if (typeof x === 'string' && typeof y === 'string') {
        // 3. we can return any type  regardless of the fact that we specified string type in step 1
        return 100;
    }

    if (typeof x === 'number' && typeof y === 'number') {
        return x + y
    }

    throw new Error('invalid arguments passed');
}

// 4. we expect that str has type string, but it's number
const str = add("Hello", "World!");
const num = add(10, 20);
```
</details>

<details>
<summary>Passing arguments to a function with an unsupported value</summary>

```typescript
type FormatAmount = {
  currencySymbol?: string,
  value: number
}

const formatAmount = ({ currencySymbol = '$', value }: FormatAmount) => {
  return `${currencySymbol} ${value}`;
}

const formatAmountParams = {
  currencySymbol: 'USD',
  value: 10,
  // 1. FormatAmount doesn't have anotherValue
  anotherValue: 20
}

formatAmount(formatAmountParams); // 2. no error, if we pass object as argument with unsupported value
formatAmount({ currencySymbol: '', value: 10, anotherValue: 12 }); 3. // error, if we pass object as argument and set unsupported value manually
```

The problem may be when we refactor name currencySymbol to currencySign, but params can have old currencySymbol

```typescript
type FormatAmount = {
  // 1. Refactor currencySymbol to currencySign
  currencySign?: string,
  value: number
}

// 2. ts shows an error if we pass currencySymbol, so we change to currencySign
const formatAmount = ({ currencySign = '$', value }: FormatAmount) => {
  return `${currencySign} ${value}`;
}

const formatAmountParams = {
  // 3. It's old name
  currencySymbol: 'USD',
  value: 10
}

// 4. There is no error after refactor, we expect 'USD 10', but got '$ 10'
formatAmount(formatAmountParams);
```
</details>

<details>
<summary>
  Typescript might not recognize when change data type 
</summary>

```typescript
type Metadata = {};

// 1. We create Map type
type UserMetadata = Map<string, Metadata>;

const cache: UserMetadata = new Map();

// 2. It works because cache is Map
console.log(cache.get('foo'));

// 3. We create cacheCopy as object
const cacheCopy: UserMetadata = { ...cache };

// 4. We get error because it's not a Map
console.log(cacheCopy.get('foo'));
```
</details>
