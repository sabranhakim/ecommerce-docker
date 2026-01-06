from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from database import reviews_collection
from bson import ObjectId

app = FastAPI()

# Pydantic model for request body
class ReviewIn(BaseModel):
    product_id: int
    review: str
    rating: int

# Helper to convert MongoDB doc to a dictionary and handle ObjectId
def review_helper(review) -> dict:
    return {
        "id": str(review["_id"]),
        "product_id": review["product_id"],
        "review": review["review"],
        "rating": review["rating"],
    }

@app.post("/reviews")
def create_review(review: ReviewIn):
    try:
        review_dict = review.dict()
        result = reviews_collection.insert_one(review_dict)
        created_review = reviews_collection.find_one({"_id": result.inserted_id})
        return {
            "success": True,
            "message": "Review created successfully",
            "data": review_helper(created_review)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reviews")
def get_all_reviews():
    try:
        reviews = [review_helper(r) for r in reviews_collection.find()]
        return {
            "success": True,
            "data": reviews
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reviews/{product_id}")
def get_reviews_by_product_id(product_id: int):
    try:
        reviews = [review_helper(r) for r in reviews_collection.find({"product_id": product_id})]
        return {
            "success": True,
            "data": reviews
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))