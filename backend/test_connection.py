"""
==========================================================
BearingIQ
Database Connection Test
==========================================================
"""

from sqlalchemy import text

from app.database.connection import engine


def test_connection():

    print("=" * 60)
    print("Testing PostgreSQL Connection")
    print("=" * 60)

    try:

        with engine.connect() as connection:

            result = connection.execute(

                text("SELECT version();")

            )

            print("Connection Successful")
            print()

            print(result.scalar())

    except Exception as error:

        print("Connection Failed")

        print(error)


if __name__ == "__main__":

    test_connection()