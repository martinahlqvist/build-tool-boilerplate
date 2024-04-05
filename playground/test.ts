const prepInt = (int: number): string => {
	return "We got an integer: " + int;
};

for (let i = 0; i < 10; i++) {
	console.log(prepInt(i));
}
console.log("Done!");
