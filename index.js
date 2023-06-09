const express = require('express')
const { engine } = require('express-handlebars')
const morgan = require('morgan')
const FakeProductsDB = require('./store/fakeProductDB')
const port = 9001
const productsDB = new FakeProductsDB()

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './views')

app.get('/', viewProductList)
app.get('/realTimeProducts', viewCreateProduct)
app.post('/product', validateProduct, postProduct)
app.listen(port, () => console.log(`Server running at port ${port}`))

function viewProductList(req, res) {
  const products = productsDB.getAllProducts()
  res.render('home', { products })
}

function viewCreateProduct(req, res) {
  const { error, title, price, thumbnail } = req.query
  return res.render('realTimeProducts', { error, title, price, thumbnail })
}

function postProduct(req, res) {
  const { error } = req
  if (error && error.length > 0) {
    return res.redirect(
      `/realTimeProducts/?error=${error}&title=${req.title}&price=${req.price}&thumbnail=${req.thumbnail}`
    )
  }
  const { title, price, thumbnail } = req.body
  productsDB.postProduct({ title, price, thumbnail })
  return res.redirect('/')
}

// helpers

function validateProduct(req, res, next) {
  const { title, price, thumbnail } = req.body
  if (!title || !price || !thumbnail || !title.trim() || !thumbnail.trim()) {
    req.error = 'faltan datos del producto'
  } else if (isNaN(price)) {
    req.error = 'El precio debe ser de tipo numérico'
  } else if (!thumbnail.includes('http')) {
    req.error = 'La URL de la foto debe iniciar con http'
  }
  req.title = title
  req.price = price
  req.thumbnail = thumbnail
  next()
}
