function helloWorld(name) {
    console.log("Hello, " + name + "!");
}
const nums = [1, 2, 3, 4, 5];
let doubled = nums.map((n) => {
    return n * 2;
});
if (doubled.length > 0) {
    console.log("Doubled numbers:", doubled);
}
const obj = { foo: "bar", baz: { qux: [1, 2, 3] } };
async function fetchData(url) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Data:", data);
    } catch (err) {
        console.error("Error:", err);
    }
}
fetchData("https://jsonplaceholder.typicode.com/posts/1");
