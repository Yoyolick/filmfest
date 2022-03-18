import os
from flask import Flask, send_from_directory, request, g, jsonify
import sqlite3
import json
import hashlib
import re
import secrets
import time
from flask_cors import CORS
from datetime import datetime, timedelta, timezone

app = Flask(__name__, static_folder='filmfest/server')

# global variables
DATABASE = "gerdy.db"
CORS(app)


# connecting to our db
def get_db():
    try:
        db = getattr(g, "_database", None)
        if db is None:
            db = g._database = sqlite3.connect(DATABASE)
        return db
    except Exception as e:
        return e


# executing a db change
def execute_db(cmd):
    try:
        con = sqlite3.connect(DATABASE)
        c = con.cursor()
        c.execute(cmd)
        con.commit()
    except Exception as e:
        return e


# probing db for data
def query_db(query, args=(), one=False):
    try:
        cur = get_db().execute(query, args)
        rv = cur.fetchall()
        cur.close()
        return (rv[0] if rv else None) if one else rv
    except Exception as e:
        return e

def authorized(paramID,paramKEY):
    #get our users accesstoken and its expiry
    data = query_db('SELECT accesstoken,tokenexpires FROM users WHERE id="'+paramID+'"')[0]
    #if our access token matches the token passed with the request
    if(paramKEY == data[0]):
        #if token expiry data is still in the future
        if(int(data[1]) > int(time.time())):
            print("not expired")
            return True #user is authorized
        else:
            print("expired")
            return False #user is not authorized
    else:
        print("key not matches")
        print(paramKEY,data[0])
        return False #user is not authorized

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/signup', methods=["POST"])
def signup():
    try:
        if(query_db('SELECT * FROM users WHERE email="'+request.json['email']+'"') != []):
            return 'taken'
        else:
            execute_db('INSERT INTO users (first,last,email,password,bio,badges,priv) VALUES ("'+request.json['first']+'","'+request.json['last']+'","'+request.json['email']+'","'+(hashlib.sha256(request.json['password'].encode('utf-8')).hexdigest())+'","","","comment")')
            try:
                os.mkdir('filmfest/server/users/'+str(query_db('select id from users where email="'+request.json['email']+'"')[0][0]))
            except:
                #TODO MAYBE HANDLING HERE BUT ASSUMING THIS IS JUST BECAUSE ACCOUNT DELETED FROM TABLE BUT ACCOUNTS SHOULD NEVER BE DELETED IT WOULD SHIFT EVERYTHING DOWN
                pass
            return 'created'
    except Exception as e:
        print(e)
        return 'error'

@app.route("/login", methods=["POST"])
def login():
    try:
        correct = query_db('select password from users where email="'+request.json['email']+'"')[0][0]
        provided = hashlib.sha256(request.json['password'].encode('utf-8')).hexdigest()
        if (correct == provided):
            key = secrets.token_hex(16)
            execute_db('update users set accesstoken="'+key+'" where email="'+request.json['email']+'"')
            epoch = int(time.time())
            expireamount = 86400 #expire time
            expiration = epoch + expireamount
            execute_db('update users set tokenexpires="'+str(expiration)+'" where email="'+request.json['email']+'"')
            
            data = query_db('select id,priv from users where email="'+request.json['email']+'"')[0]
            
            return json.dumps({"key":key,"expires":expiration,"id":str(data[0]),"priv":str(data[1])})
        else:
            return 'wrong'
    except:
        return 'An error has occurred'

@app.route("/refreshkey", methods=["POST"])
def refreshkey():
    if (authorized(request.json['id'],request.json['key'])):
        key = secrets.token_hex(16)
        execute_db('update users set accesstoken="'+key+'" where id="'+request.json['id']+'"')
        epoch = int(time.time())
        expireamount = 86400 #expire time
        expiration = epoch + expireamount
        execute_db('update users set tokenexpires="'+str(expiration)+'" where id="'+request.json['id']+'"')
        return json.dumps({"key":key,"expires":expiration})
    else:
        return 'wrong'

@app.route("/editprofile", methods=["POST"])
def editprofile():
    if(authorized(request.form['id'], request.form['key'])):
        try:
            if request.files["file"]:
                #if file
                uploaded_file = request.files["file"]

                extension = query_db('select pfp from users where id="'+request.form['id']+'"')[0][0]
                if(extension != None):
                    os.remove('filmfest/server/users/'+request.form['id']+"/pfp."+extension)
                uploaded_file.save("filmfest/server/users/" + request.form['id'] + "/pfp."+re.sub(r"\.(?![^.]*$)", "", uploaded_file.filename).split(".")[1])
                execute_db('update users set pfp="'+re.sub(r"\.(?![^.]*$)", "", uploaded_file.filename).split(".")[1]+'" where id='+request.form['id'])
        except Exception as e:
            #no file
            print(e)
            pass

        idd = request.form['id']
        first = request.form['first']
        last = request.form['last']
        bio = request.form['bio']
        key = request.form['key']

        execute_db('update users set first="'+first+'",last="'+last+'",bio="'+bio+'" where id="'+idd+'"')

        return "done"
    else:
        return "unauthorized"

@app.route("/pdata", methods=["POST"])
def pdata():
    #starting data
    data = {
            "name":"",
            "bio":"",
            "badges":"",
            "owned":"false",
            "priv":"",
            "pfp":""
            #profile picture here eventually
    }
    #query for data
    profiledata = query_db('select distinct first,last,bio,badges,priv,pfp from users where id="'+request.json['profileid']+'"')
    if(len(profiledata) > 0): #check if exists
        #update keys if its does
        data.update(first=str(profiledata[0][0]))
        data.update(last=str(profiledata[0][1]))
        data.update(bio=str(profiledata[0][2]))
        data.update(badges=str(profiledata[0][3]))
        data.update(priv=str(profiledata[0][4]))

        if(profiledata[0][5] == None):
            data.update(pfp="http://127.0.0.1:5000/users/defualt/pfp.jpeg")
        else:
            data.update(pfp="http://127.0.0.1:5000/users/"+request.json['profileid']+"/pfp."+str(profiledata[0][5]))

        #user is not authenticated
        if(request.json['userid'] == None or request.json['userkey'] == None):
                #return normal data telling them its not them
                return json.dumps(data)
        #user has given us some form of authentication
        else:
            #check if user is claiming this is them
            if(request.json['userid'] != request.json['profileid']):
                #they arent so just give them the data with owned=false
                return json.dumps(data)
            else: #user is claiming this is them
                #check for broken authentication
                #TODO THIS IS UNREACHABLE BEACUSE OF FIRST RETURN CHECK LOW PRIO
                if((request.json['userid'] == None and request.json['userkey'] != None) or (request.json['userid'] != None and request.json['userkey'] == None)):
                    return 'broken'
                else:
                    #authenticate the user
                    if(authorized(request.json['userid'],request.json['userkey'])):
                        data.update(owned="true")
                        return json.dumps(data)
                    else: #if not authorized
                        return 'unauthorized'
    else:
        return 'notexist'

@app.route('/admin')
def admin():
    priv = query_db('select priv from users where id='+request.json['id'])[0][0]
    if(authorized(request.json['id'], request.json['key']) and (priv == 'admin' or priv == 'dev')):
        if(request.json["action"] == 'ban'):
            execute_db('update users set priv="banned" where id="'+request.json['actionid']+'"')
            return "success"
    else:
        return "unauthorized"

@app.route("/userlist", methods=["POST"])
def userlist(): #THIS WILL NEED REDONE FOR SEARCH TERMS AND OTHER BS AND WHETHER OR NOT ADMIN IS CALLING IT POSSIBLY ADMIN CHANGES ONLY ON CLIENTSIDE
    #IF USER ASKING IS ADMIN SEND THEIR PRIV BACK WITH THEM AS VERIFICATION
    priv = query_db('select priv from users where id='+request.json['id'])[0][0]
    if(authorized(request.json['id'], request.json['key']) and (priv == 'admin' or priv == 'dev')):
        return json.dumps(query_db('select id,first,last,priv,pfp from users')) #TODO THIS NEEDS PAGIZATION
    else:
        return 'unauthorized'


if __name__ == '__main__':
    app.run(host='127.0.0.1', use_reloader=True, port=5000, threaded=True, debug=True)