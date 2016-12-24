import './index.css'
let demos = require('./demos/index').default

let playground
let div = document.createElement('div')
div.classList.add('demos')

Object.keys(demos).map(demo => {
  let link = document.createElement('a')
  link.appendChild(document.createTextNode(demo))
  link.addEventListener('mousedown', (event) => {
    if(playground) console.log('trash')
    playground = new demos[event.currentTarget.textContent]()
  })
  div.appendChild(link)
})

document.querySelector('.overlay').appendChild(div)
