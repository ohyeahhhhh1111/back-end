const express = require("express")
const propertiesReader = require("properties-reader")
const path = require('node:path')
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 })
const db = client.db(dbName)


//get uri from db.properties
const propertiesPath = path.resolve(__dirname, "conf/db.properties")
const properties = propertiesReader(propertiesPath)
const dbPprefix = properties.get("db.prefix")
//URL-Encoding of User and PWD
//for potential special characters
const dbUsername = encodeURIComponent(properties.get("db.user"))
const dbPwd = encodeURIComponent(properties.get("db.password"))
const dbName = properties.get("db.dbName")
const dbUrl = properties.get("db.host")
const dbParams = properties.get("db.options")
const uri = dbPprefix + dbUsername + ":" + dbPwd + dbUrl + dbParams


app.use(cors())
app.use(express.json())


app.param('collectionName', function(req, res, next, collectionName) {
    console.log(collectionName)
    req.collection = db.collection(collectionName)
    return next()
})


app.get('/collections/:collectionName', function(req, res, next) {
    req.collection.find({}).toArray(function(err, results) {
        if (err) {
            return next(err)
        }
        console.log("GET")
        res.send(results)
    })
})


app.get('/collections/:collectionName/:max/:sortAspect/:sortAscDesc', function(req, res, next) {
    // TODO: Validate params
    var max = parseInt(req.params.max, 10) // base 10
    let sortDirection = 1
    if (req.params.sortAscDesc === "desc") {
        sortDirection = -1
    }
    req.collection.find({}, {limit: max, sort: [[req.params.sortAspect, sortDirection]]}).toArray(function(err, results) {
    if (err) {
        return next(err)
    }
    res.send(results)
    })
})


app.post('/collections/:collectionName', function(req, res, next) {
    // TODO: Validate req.body
    console.log("Order POST!")
    req.collection.insertOne(req.body, function(err, results) {
    if (err) {
        return next(err)
    }
    res.send(results)
    })
})


app.listen(3000, () => console.log('Server is running on http://localhost:3000'))