import { db } from "../utils/db.js";
import { ObjectId } from "mongodb";
import { Router } from "express";

const cartRouter = Router();

// คำนวน ส่วนลดที่ได้จากการซื้อหนังสือไม่ซ้ำกัน
function calculateDiscount(uniqueBooksCount, totalPrice) {
  let discountPercentage = 0;

  if (uniqueBooksCount >= 2 && uniqueBooksCount <= 7) {
    discountPercentage = (uniqueBooksCount - 1) * 0.1;
  } else {
    discountPercentage = 0.6;
  }

  return totalPrice * discountPercentage;
}

cartRouter.post("/", async (req, res) => {
  const user_id = req.body.user_id;
  const products = req.body.products;

  try {
    //เช็ค ว่า user_id นี้ มีตะกร้าแล้วหรือยัง
    let cart = await db.collection("carts").findOne({ user_id });
    if (!cart) {
      cart = { user_id, Cartitems: [] };
    }

    // เพิ่มของลง ตะกร้า
    for (let product of products) {
      const productId = new ObjectId(product.product_id);

      const bookData = await db
        .collection("books_inventory")
        .findOne({ _id: productId });

      // Check ว่า ใน ​Database มีข้อมูล หนังสือที่ส่งมาอยู่มั้ย
      if (bookData) {
        const existingProductIndex = cart.Cartitems.findIndex(
          (Cartitem) => Cartitem.product_id === productId.toString()
        ); // ถ้ามีจะทำการเช็ค ว่า ใน ตะกร้า หนังสือเล่มนี้แล้วหรือยัง

        if (existingProductIndex === -1) {
          // ถ้าไม่มีจะทำการเพิ่มข้อมูล ของ books ตาม producId ที่ส่งมาลงใน cart

          cart.Cartitems.push({
            product_id: productId.toString(),
            title: bookData.title,
            quantity: product.quantity,
            pricePerUnit: bookData.price,
            totalPrice: product.quantity * bookData.price,
          });
        } else {
          cart.Cartitems[existingProductIndex].quantity += product.quantity;
          cart.Cartitems[existingProductIndex].totalPrice =
            cart.Cartitems[existingProductIndex].quantity *
            cart.Cartitems[existingProductIndex].pricePerUnit;
        }
      }
    }

    // เก็บค่าราคาทั้งหมดของตะกร้าที่ยังไม่ได้ลด % หนังสือไว้ ก่อน
    let totalPrice = cart.Cartitems.reduce(
      (sum, eachItem) => sum + eachItem.totalPrice,
      0
    );

    //นับหนังสือที่ไม่ซ้ำกัน เพื่อใช้คำนวนส่วนลด
    const productIds = cart.Cartitems.map((item) => {
      console.log(cart.Cartitems);
      return item.product_id;
    });

    console.log("productIds" , productIds);

    
    let uniqueBooksCount = productIds.length;

    let discount = calculateDiscount(uniqueBooksCount, totalPrice);
    const finalPrice = totalPrice - discount;

    cart.totalPrice = totalPrice;
    cart.discount = discount;
    cart.finalPrice = finalPrice;

    await db
      .collection("carts")
      .updateOne({ user_id }, { $set: cart }, { upsert: true });

    return res.json(cart);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error adding product to cart: ${error}` });
  }
});

export default cartRouter;