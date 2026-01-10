from pymongo import MongoClient
import os
import time

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://admin:admin123@mongo:27017/reviewdb?authSource=admin"
)


def connect_with_retry():
    retries = 5
    while retries:
        try:
            client = MongoClient(MONGO_URI)
            client.admin.command("ping")
            print("MongoDB is ready!")
            return client
        except Exception as e:
            print(f"Attempt {5 - retries + 1} failed: {e}")
            time.sleep(2)
            retries -= 1
    raise Exception("Could not connect to MongoDB after several attempts.")

client = connect_with_retry()
db = client[os.getenv("MONGO_DB_NAME", "reviewdb")]
reviews_collection = db["reviews"]