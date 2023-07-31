// TERNARY: IF ELSE
const maxAge = 44;

const ageStatus = maxAge >= 18 ? 'adult' : 'kid';

console.log(ageStatus);

// SHORT-CIRCUIT: IF

const readyToGo = true;
// camelCasing (first letter is lowercase and words after start with capital)
const maxIsAKid = ageStatus === 'kid';

const letsGo = () => console.log("WE'RE GOING");

readyToGo && maxIsAKid && letsGo();
