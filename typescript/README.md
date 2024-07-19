# Typescript

- [typescript playground](https://www.typescriptlang.org/play): with support different typescript versions
- [ts-reset](https://github.com/total-typescript/ts-reset): a 'CSS reset' for TypeScript, improving types for common JavaScript API's
- [TypeScript is a Structural Type System](https://www.typescriptlang.org/play/typescript/language/structural-typing.ts.html): typescript playground example

## Examples of non-obvious typescript behavior

<details>
<summary>
  Any (ts-reset can fix it)
</summary>

```typescript
// JSON.parse
const a = JSON.parse('{ a: 1 }') // any
```

```typescript
// Array.isArray
function parse(a: unknown) {
	if (Array.isArray(a)) {
		console.log(a) // a[any]
	}
}
```

```typescript
// fetch
fetch('/')
	.then((res) => res.json())
	.then((json) => {
		console.log(json) // any
	})
```

```typescript
// localStorage, sessionStorage
const a = localStorage.a // any
const b = sessionStorage.b // any
```

</details>

<details>
<summary>
  Array includes method too strict on as const arrays (ts-reset can fix it)
</summary>

it's the same as indexOf, Set.has(), Map.has()

```typescript
// 1. set users array as const
const userIds = [1, 2, 3] as const

// 2. Error: Argument of type '4' is not assignable to parameter of type '1 | 2 | 3'.
userIds.includes(4)
```

</details>

<details>
<summary>
  Filter array from undefined (Inferred Type Predicates) (fixed in 5.5)
</summary>

[https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#inferred-type-predicates](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#inferred-type-predicates)

```typescript
const arr = [1, 2, undefined]

// Below 5.5 newArr type is (number | undefined)[], in 5.5 and higher newArr type is number[]
const newArr = arr.filter((item) => item !== undefined)

// Below 5.5 it could be fixed with predicate newArr2 type is number[]
const newArr3 = arr.filter((item): item is number => item !== undefined)
```

</details>

<details>
<summary>
  Control Flow Narrowing for Constant Indexed Accesses (fixed in 5.5)
</summary>

[https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#control-flow-narrowing-for-constant-indexed-accesses](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#control-flow-narrowing-for-constant-indexed-accesses)

```typescript
function f1(obj: Record<string, unknown>, key: string) {
	if (typeof obj[key] === 'string') {
		// Below 5.5 there was an error
		obj[key].toUpperCase()
	}
}
```

</details>

<details>
<summary>
  Undefined-Returning Functions must have an explicit return (fixed in 5.1)
</summary>

[https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#control-flow-analysis-for-bracketed-element-access](https://devblogs.microsoft.com/typescript/announcing-typescript-5-1-rc/#easier-implicit-returns-for-undefined-returning-functions)

```typescript
// no error - we inferred that 'f1' returns 'void'
function f1() {
	// no returns
}

// no error - 'void' doesn't need a return statement
function f2(): void {
	// no returns
}

// no error - 'any' doesn't need a return statement
function f3(): any {
	// no returns
}

//  Below 5.1 there is an error
// A function whose declared type is neither 'void' nor 'any' must return a value.
function f4(): undefined {
	// no returns
}
```

</details>


<details>
<summary>
  Enums issues (fixed in 5.0)
</summary>

[https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#enum-overhaul](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#enum-overhaul)

```typescript
enum SomeEvenDigit {
	Zero = 0,
	Two = 2,
	Four = 4,
}

// Below 5 there is no error
const a: SomeEvenDigit = 1
```

```typescript
enum LogLevel {
	Debug, // 0
	Log, // 1
	Warning, // 2
	Error, // 3
}

const showMessage = (logLevel: LogLevel, message: string) => {
	// code...
}

// 1. It's expected
showMessage(0, 'debug message')
showMessage(2, 'warning message')

// 2. Below 5 there is no error
showMessage(-100, 'any message')
```

```typescript
enum User {
	name = 'name',
	// Below 5 there is error: Computed values are not permitted in an enum with string valued members.
	userName = `user${User.name}`,
}
```

</details>

<details>
<summary>
  Control-Flow Analysis for Bracketed Element Access (fixed in 4.7)
</summary>

[https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#control-flow-analysis-for-bracketed-element-access](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#control-flow-analysis-for-bracketed-element-access)

```typescript
const query: Record<string, string | string[]> = {}

const COUNTRY_KEY = 'country'

if (typeof query[COUNTRY_KEY] === 'string') {
	// There is an error below 4.7, because it's still a string, or a string[]
	const queryCountry: string = query[COUNTRY_KEY]
}
```

</details>

<details>
<summary>
  Enums act as nominal typing, not structural typing
</summary>

```typescript
enum LogLevel {
	Debug = 'Debug',
	Error = 'Error',
}

const showMessage = (logLevel: LogLevel, message: string) => {
	// code...
}

// 1. Error argument of type '"Debug"' is not assignable to parameter of type 'LogLevel'
// but this is nominal typing behavior, ts expects exact value from enum LogLevel
showMessage('Debug', 'some text')

// 2. Even if we create a new enam with the same values it won't work
enum LogLevel2 {
	Debug = 'Debug',
	Error = 'Error',
}
showMessage(LogLevel2.Debug, 'some text')

// 3. A more obvious way to use objects with as const
const LOG_LEVEL = {
	DEBUG: 'debug',
	ERROR: 'error',
} as const

type ObjectValues<T> = T[keyof T]

type LogLevel = ObjectValues<typeof LOG_LEVEL>

const logMessage = (logLevel: LogLevel, message: string) => {
	// code...
}

// 4. There is no error because it works with a simple value, no matter where the value is passed from
logMessage('debug', 'some text')
logMessage(LOG_LEVEL.DEBUG, 'some text')
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
		return 100
	}

	if (typeof x === 'number' && typeof y === 'number') {
		return x + y
	}

	throw new Error('invalid arguments passed')
}

// 4. we expect that str has type string, but it's number
const str = add('Hello', 'World!')
const num = add(10, 20)
```

</details>

<details>
<summary>Passing an object as a function argument with a excess property</summary>

```typescript
type FormatAmount = {
	currencySymbol?: string
	value: number
}

const formatAmount = ({ currencySymbol = '$', value }: FormatAmount) => {
	return `${currencySymbol} ${value}`
}

const formatAmountParams = {
	currencySymbol: 'USD',
	value: 10,
	// 1. FormatAmount doesn't have anotherValue
	anotherValue: 20,
}

formatAmount(formatAmountParams) // 2. no error, if we pass object as argument with unsupported value
formatAmount({ currencySymbol: '', value: 10, anotherValue: 12 })
3 // error, if we pass object as argument and set unsupported value manually
```

The problem may be when we refactor name currencySymbol to currencySign, but params can have old currencySymbol

```typescript
type FormatAmount = {
	// 1. Refactor currencySymbol to currencySign
	currencySign?: string
	value: number
}

// 2. ts shows an error if we pass currencySymbol, so we change to currencySign
const formatAmount = ({ currencySign = '$', value }: FormatAmount) => {
	return `${currencySign} ${value}`
}

const formatAmountParams = {
	// 3. It's old name
	currencySymbol: 'USD',
	value: 10,
}

// 4. There is no error after refactor, we expect 'USD 10', but got '$ 10'
formatAmount(formatAmountParams)
```

> TypeScript is a structural typing system. One of the effects of this is that TypeScript can't always guarantee that your object types don't contain excess properties [reset-ts description](https://github.com/total-typescript/ts-reset/tree/65fc5500ed4f383400d1bb73f95e1263a2860c49#objectkeysobjectentries)

```typescript
type Func = () => {
	id: string
}

const func: Func = () => {
	return {
		id: '123',
		// No error on an excess property!
		name: 'Hello!',
	}
}
```

</details>

<details>
<summary>Loss of key typing when Object.keys</summary>

```typescript
const obj = { a: 1, b: 2 }

Object.keys(obj).forEach((key) => {
	// 1. Error because key is of string type
	console.log(obj[key])

	// 2. Possible solution is typecasting with as, but this may not be safe
	console.log(key as keyof typeof obj)
})
```

> TypeScript is a structural typing system. One of the effects of this is that TypeScript can't always guarantee that your object types don't contain excess properties [reset-ts description](https://github.com/total-typescript/ts-reset/tree/65fc5500ed4f383400d1bb73f95e1263a2860c49#objectkeysobjectentries)

```typescript
type Func = () => {
	id: string
	userName: string
}

const func: Func = () => {
	return {
		id: '123',
		userName: 'Peter',
		// 1. No error on an excess property
		name: 'Excess property',
	}
}

const result = func()

Object.keys(result).forEach((key) => {
	// 2. We get type "id" | "userName"
	const typedKey = key as keyof typeof result

	// 3. And we expect '123' and 'Peter', but we also get 'Excess property'
	console.log(result[typedKey])
})
```

</details>

<details>
<summary>
  Typescript might not recognize when change data type 
</summary>

```typescript
type Metadata = {}

// 1. We create Map type
type UserMetadata = Map<string, Metadata>

const cache: UserMetadata = new Map()

// 2. It works because cache is Map
console.log(cache.get('foo'))

// 3. We create cacheCopy as an object, but spread doesn't copy prototypes, so we won't have methods like Map does
const cacheCopy: UserMetadata = { ...cache }

// 4. We get error because it's not a Map
console.log(cacheCopy.get('foo'))
```

</details>

<details>
<summary>
  Declaration merging
</summary>

[https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces)

```typescript
interface User {
	id: number
}

interface User {
	name: string
}

// Error: Property 'id' is missing in type '{ name: string; }' but required in type 'User', because User interfaces merged
const user: User = {
	name: 'bar',
}
```

```typescript
interface Comment {
	id: number
	text: string
}

// Error: Type '{ id: number; text: string; }' is missing the following properties from type 'Comment': data, length, ownerDocument, appendData, and 59 more.
// Comment already exists in lib.dom.d.ts
const comment: Comment = {
	id: 5,
	text: 'good video!',
}
```

</details>

**Related links**

- [Be Careful With Return Types In TypeScript](https://www.youtube.com/watch?v=I6V2FkW1ozQ): youtube video by Theo - t3.gg
- [ТОП 8 вещей которые я не люблю в TypeScript](https://www.youtube.com/watch?v=jEWLhZ3ZJzQ): youtube video by Ayub Begimkulov
- [Enums considered harmful](https://www.youtube.com/watch?v=jjMbPt_H3RQ): youtube video by
  Matt Pocock
