const express = require('express')
const router = new express.Router()



// models
const Hero = require(__basedir + '/models/hero')
const Comment = require(__basedir + '/models/comment')

const DEFAULT_HEROES_PER_PAGE = 10
const DEFAULT_COMMENTS_PER_PAGE = 3

/**
 * Some API endpoints in this application are sorted and paginated. Here, we will go over
 * some details about sorting and paginating the resulting heroes.
 * 
 * In this applicaiton, we sort the heroes in our database based on "name" alphabetically
 * so that top results start with A going all the way to Z. To learn how to use sort in mongoose,
 * please visit their documentation: https://mongoosejs.com/docs/api.html#query_Query-sort
 * 
 * Pagination is used to return parts of the results to the user in series of pages.
 * You can read about pagination in mongodb here: https://docs.mongodb.com/manual/reference/method/cursor.skip/#pagination-example
 * For example imagine that maximum number of items per page is 5 and we have 7 items in
 * our database. As a result, we need to return the first 5 elements in the first page.
 * For the second page, we need to `skip` over the first 5 elements and return the remaining
 * elements (up to a maximum of 5). As a result, our query from the database for paginated
 * results would typically look like this:
 *    const results = await Hero.find({...}).sort({...}).skip((page - 1) * limit).limit(limit)
 * Note: `page` is the page that we want to fetch the results for and `limit` is the maximum
 * number of elements allowed per page. In our previous example, limit was 5.
 * Note: the number of pages can be calculated as `Math.ceil(count / limit)`
 * 
 * In this application, we will use the `DEFAULT_HEROES_PER_PAGE` variable as the maximum 
 * number of items per page for the endpoints
 * that return a list of heroes and `DEFAULT_COMMENTS_PER_PAGE` variable as the maximum 
 * number of items per page for the endpoints that return a list of comments.
 */

// GET /heroes -> gets a list of heroes, sorted and paginated
router.get('/heroes', async (req, res) => {
  // TODO: fill out the code for the endpoint
  const page = req.query.page

  const result  = await Hero.find().sort({name:1}).skip((page - 1) * DEFAULT_HEROES_PER_PAGE).limit(DEFAULT_HEROES_PER_PAGE)
 
  res.send({msg:result})
})

// ADD - START HERE 

router.get('/', async (req, res) => {

const page = req.query.page

const result  = await Hero.find().sort({name:1}).skip((page - 1) * DEFAULT_HEROES_PER_PAGE).limit(DEFAULT_HEROES_PER_PAGE)
//const context = {result, layout:null}
//res.render('home',context)



  res.send(`
<!DOCTYPE html>
<html>
  <body>
    <h1>Homepage</h1>
    ${result}
  </body>
</html>
  `)
})

// ADD - STOP HERE


// GET /heroes/:id --> gets a hero by id
router.get('/heroes/:id', async (req, res) => {
  // TODO: fill out the code for the endpoint
  const id = req.params.id
  //var ObjectID = require('mongodb').ObjectId
  const result  = await Hero.find({original_id:id})
  res.send({msg:result})
})

// POST /search/heroes/by-name --> searches for heroes by name, starting with the query provided as JSON object {"query": "..."}, sorted and paginated
/**
 * Note: only return heroes whose names **start** with the provided query. For example, if our request says
 * `{"query": "fla"}`, we need to look for heroes whose names start with `fla` (case **insensitive**) like `Flash`.
 */
router.post('/search/heroes/by-name', async (req, res) => {
  // TODO: fill out the code for the endpoint
  const page = req.query.page
  const _name = req.body.query

  const regExCondition = new RegExp(_name)
  const result  = await Hero.find({name:{$regex: regExCondition, $options: 'i'}}).sort({name:1}).skip((page - 1) * DEFAULT_HEROES_PER_PAGE).limit(DEFAULT_HEROES_PER_PAGE)
  res.send({msg:result})
 

})

// POST /search/heroes/by-min-stats --> searches for heroes with powerstats greater than or equal to the provided values.
/**
 * Note: here, return heroes with powerstats greater than or equal to the provided values.
 * For example, if the query object is `{"speed": 100, "intelligence": 95}`, we are looking for heroes
 * whose `powerstats.speed` is greater than or equal to 100 **and** `powerstats.intelligence` is greater
 * than or equal to 95. The following powerstats would be acceptable:
 * 
 * "powerstats": {
 *    "intelligence": 100,
 *    "strength": 85,
 *    "speed": 100,
 *    "durability": 100,
 *    "power": 100,
 *    "combat": 50
 *  }
 * 
 */
router.post('/search/heroes/by-min-stats', async (req, res) => {
  // TODO: fill out the code for the endpoint
  const page = req.query.page
  const speed = req.body.speed
  const intelligence = req.body.intelligence

  const result  = await Hero.find({powerstats:{speed:{$gte:speed}, intelligence:{$gte:intelligence}}}).sort({name:1}).skip((page - 1) * DEFAULT_HEROES_PER_PAGE).limit(DEFAULT_HEROES_PER_PAGE)
  res.send({msg:result})
})

// POST /heroes/:id/comments --> creates a comment for a hero, gets the object structure as JSON
/**
 * Note: here we want to `populate` the hero field.
 * For more information, see: https://mongoosejs.com/docs/populate.html
 */
router.post('/heroes/:id/comments', async (req, res) => {
  // TODO: fill out the code for the endpoint
  const id = req.params.id
  const comment = req.body.text

  await Comment.create({hero: id, text: comment})
  res.send({msg:'success!'})

})

// GET /heroes/:id/comments --> gets the comments for a hero, paginated, sorted by posting date (descending, meaning from new to old)
router.get('/heroes/:id/comments', async (req, res) => {
  // TODO: fill out the code for the endpoint
  const page = req.query.page
  const id = req.params.id
  const result  = await Comment.find({hero : id}).sort({timestamps:-1}).skip((page - 1) * DEFAULT_HEROES_PER_PAGE).limit(DEFAULT_HEROES_PER_PAGE)
})

module.exports = router
