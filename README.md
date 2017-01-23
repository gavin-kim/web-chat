# web-chat-server

RESTful services

* GET: retrieve inforamtion                
{ GET /addresses/1 }

**POST**: used to create or updated an entity 
`POST /addresses`

**PUT**: store an entity at a URI. PUT can create a new entity or update an existing one. PUT request is idempotent.
**NOTE**: PUT replaces an existing entity. If only a subset of data elements are provided.
`PUT /addresses/1`

**PATCH**: update only the specified fields of an entity at a URI. PATCH request is idempotent.
`PATCH /addresses/1`

**DELETE**: request that a resource be removed. the resource does not have to be removed immediately.
It coutd be an asynchronous or long-running request.
`DELETE /addresses/1`

<ul>
<li>1XX - informational</li>
<li>2XX - success</li>
<li>3XX - redirection</li>
<li>4XX - client error</li>
<li>5XX - server error</li>
</ul>

GET    /chat/session/new 
POST   /chat/session
DELETE /chat/session


GET    /users/new
POST   /users/              
GET    /users/xxx           GET the details of the user with id xxx
PUT    /users/xxx           Update a user with id xxx 

(POST is used when you don't know where to put)
POST /users        
PUT  /user/id
