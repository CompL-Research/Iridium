

let i = 0
console.log(`[Set Interval] ${i++}`);
setInterval(() => {
  console.log(`[DOPE] ${i++}`);
}, 1000)

new Promise((resolve, reject)=> {
  console.log("[I PROMISE TO BEHAVE]")
})

async function foo() {
  console.log(`[Foo starting] ${i++}`)

  let p = new Promise((resolve, reject)=> {
    setTimeout(() => {
      console.log(`[TIMEOUT] ${i++}`);
      resolve()
    }, 5000)
  })

  await p;
  console.log(`[Foo ending] ${i++}`)

}

foo()