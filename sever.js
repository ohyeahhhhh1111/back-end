const express = require("express")
const propertiesReader = require("properties-reader")
const path = require('node:path')
const cors = require('cors');
const app = express()

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

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
let db = client.db(dbName);


app.use(cors())
app.use(express.json())

app.use((req, res, next)=>{
    console.log(`${req.method} request for '${req.url}'`)
    next()
})


app.param('collectionName', function(req, res, next, collectionName) {
    console.log(collectionName)
    req.collection = db.collection(collectionName)
    return next()
})


app.get('/collections/:collectionName', function(req, res, next) {
    req.collection.find({}).toArray(function(err, results) {
        if (err) {
            res.status(404).send(err)
            console.log("404 Not Found")
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
        console.log(err)
        res.status(404)
        return next(err)
    }
    res.send(results)
    })
})

// 更新產品的 API
app.put('/collections/:collectionName/:id', async (req, res) => {
    const productId = req.params.id;
    const updatedData = req.body;

    try {
        const result = await db.collection('Products').updateOne(
            { _id: new ObjectId(productId) }, // 根據 ID 查詢
            { $set: updatedData }             // 使用 $set 更新內容
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ message: 'Product not found' });
        }

        res.status(200).send({ message: 'Product updated successfully' });
        console.log('Products list has been PUT!')
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to update product' });
    }
});


app.listen(3000, () => console.log('Server is running on http://localhost:3000'))