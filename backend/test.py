import sqlite3
import os
conn = sqlite3.connect("instance/localconnectusers.sqlite")
cursor = conn.cursor()
cursor.execute("SELECT * FROM Listings")
rows = cursor.fetchall()
print(rows)

conn.close()
