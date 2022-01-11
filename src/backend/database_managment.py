import pyodbc
import strings


#inserting
with pyodbc.connect(
        'DRIVER='+strings.driver+';SERVER=tcp:'+strings.server+';PORT=1433;DATABASE='+strings.database+';UID='+strings.username+';PWD='+ strings.password) as conn:
    with conn.cursor() as cursor:
        cursor.execute("SET IDENTITY_INSERT emails ON")
        cursor.execute("INSERT INTO emails (id, email, pass) VALUES (1, 'testmail@gmail.com', 'newpass')")


#selecting
with pyodbc.connect(
        'DRIVER='+strings.driver+';SERVER=tcp:'+strings.server+';PORT=1433;DATABASE='+strings.database+';UID='+strings.username+';PWD='+ strings.password) as conn:
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM emails")
        row = cursor.fetchone()
        while row:
            print (str(row[1]) + " " + str(row[2]))
            row = cursor.fetchone()


