import express from "express";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();

const PORT = process.env.PORT;

const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL); // dial
// Top level await
await client.connect(); // call
console.log("Mongo is connected !!!  ");

app.get("/", function (request, response) {
  response.send("🙋‍♂️ Welcome to Hall Booking API");
});

app.post("/createroom", express.json(), function (request, response) {
  const { seats, amentities, price, roomId } = request.body;
  const result = client.db("b42wd2").collection("rooms").insertOne({
    seats: seats,
    amentities: amentities,
    price: price,
    roomId: roomId,
  });

  result
    ? response.send({ message: "room created successfully" })
    : response.status(404).send({ message: "not found" });
});

// Room booking

app.post("/booking", express.json(), async function (request, response) {
  const { name, date, start, end, roomId } = request.body;

  const customerDb = await getCustomerbyRoomId(roomId, date);
  console.log(customerDb);
  if (customerDb) {
    response.send({ message: "Room was already booked" });
  } else {
    const result = client.db("b42wd2").collection("booked hall").insertOne({
      name: name,
      date: date,
      start: start,
      end: end,
      roomId: roomId,
      status: "booked",
    });
    result
      ? response.send({ message: "Room successfully booked" })
      : response.status(401).send({ message: "error occured" });
  }
});

async function getCustomerbyRoomId(roomId, date) {
  return await client
    .db("b42wd2")
    .collection("booked hall")
    .findOne({ roomId: roomId, date: date });
}

//list all rooms with booked data

app.get("/bookedrooms", async function (request, response) {
  const result = await client
    .db("b42wd2")
    .collection("booked hall")
    .find({})
    .toArray();

  response.send(result);
});

//list all customers with booked data

app.get("/customers", async function (request, response) {
  const result = await client
    .db("b42wd2")
    .collection("booked hall")
    .find({}, { status: 0 })
    .toArray();
  console.log(result);
  response.send(result);
});
app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
