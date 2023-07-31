// # STRINGS
// strings "hello", "no", "or something really long"
const kid: string = 'Max';

console.log(kid);

// # NUMBERS
const age: number = 9;

const sum: number = 25 + 2;

console.log(age);

// # FUNCTIONS

// const nameOfFunction = () => {}

const introduceSomeone = (name: string, age: number) => {
  if (!!name && !!age) {
    return `Hello ${name}, you are ${age} years old`;
  } else {
    return 'Sorry, please enter name and age';
  }
};

console.log(introduceSomeone('Bob', 674));
console.log(introduceSomeone('Barry', '555'));
console.log(introduceSomeone());
console.log(introduceSomeone('Chad'));

const addTwoNumbers = (num1: number, num2: number) => {
  return num1 + num2;
};

console.log(addTwoNumbers(7, 8));
console.log(addTwoNumbers(10, 5));

// # CONSTANT and LET

const neverChanges = 'red';
let mightChange = 'green';

mightChange = 'yellow';

// # ARRAY
// array is a list of things, it can be a list of ANYTHING

const groceryList: string[] = ['apples', 'bananas'];

console.log(groceryList);

groceryList.push('oranges');

console.log(groceryList);

groceryList.push('grapes');

console.log(groceryList);

groceryList.pop();

console.log(groceryList);
