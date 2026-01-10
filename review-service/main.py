from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId
from database import reviews_collection

app = FastAPI()

# =======================
# MODELS
# =======================

class ReviewIn(BaseModel):
    product_id: int
    review: str
    rating: int = Field(..., ge=1, le=5)
    # user_id should ideally be derived from authentication context for security
    user_id: Optional[int] = None


class ReviewUpdate(BaseModel):
    review: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    # user_id should ideally be derived from authentication context for security
    user_id: Optional[int] = None


class ReviewDelete(BaseModel):
    # user_id should ideally be derived from authentication context for security
    user_id: Optional[int] = None


# =======================
# HELPER
# =======================

def review_helper(review) -> dict:
    return {
        "id": str(review["_id"]),
        "product_id": review.get("product_id"),
        "user_id": review.get("user_id"),
        "review": review.get("review"),
        "rating": review.get("rating"),
    }


# =======================
# CREATE
# =======================

@app.post("/reviews", status_code=status.HTTP_201_CREATED)
def create_review(review: ReviewIn):
    result = reviews_collection.insert_one(review.dict())
    data = reviews_collection.find_one({"_id": result.inserted_id})
    return {
        "success": True,
        "data": review_helper(data)
    }


# =======================
# READ
# =======================

@app.get("/reviews")
def get_all_reviews():
    reviews = [review_helper(r) for r in reviews_collection.find()]
    return {"success": True, "data": reviews}


@app.get("/reviews/{product_id}")
def get_reviews_by_product(product_id: int):
    reviews = [
        review_helper(r)
        for r in reviews_collection.find({"product_id": product_id})
    ]
    return {"success": True, "data": reviews}


# =======================
# UPDATE (OWNER ONLY)
# =======================

@app.put("/reviews/{review_id}")
def update_review(review_id: str, body: ReviewUpdate):
    if not ObjectId.is_valid(review_id):
        raise HTTPException(400, "Invalid review id")

    review = reviews_collection.find_one({"_id": ObjectId(review_id)})
    if not review:
        raise HTTPException(404, "Review not found")

    if review.get("user_id") != body.user_id:
        raise HTTPException(403, "Not allowed to edit this review")

    update_data = body.dict(exclude={"user_id"}, exclude_unset=True)

    reviews_collection.update_one(
        {"_id": ObjectId(review_id)},
        {"$set": update_data}
    )

    updated = reviews_collection.find_one({"_id": ObjectId(review_id)})
    return {"success": True, "data": review_helper(updated)}


# =======================
# DELETE (OWNER ONLY)
# =======================

@app.delete("/reviews/{review_id}")
def delete_review(review_id: str, body: ReviewDelete):
    if not ObjectId.is_valid(review_id):
        raise HTTPException(400, "Invalid review id")

    review = reviews_collection.find_one({"_id": ObjectId(review_id)})
    if not review:
        raise HTTPException(404, "Review not found")

    if review.get("user_id") != body.user_id:
        raise HTTPException(403, "Not allowed to delete this review")

    reviews_collection.delete_one({"_id": ObjectId(review_id)})
    return {"success": True, "message": "Review deleted"}
