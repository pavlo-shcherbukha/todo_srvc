# todo_srvc - Node.js exptress  REST API with keycloak security


## <a name="p1.">1. Запуск локально</a>

### <a name="p1.1">1.1. Склонувати git репозиторий</a> 

```bash
  
  git clone repo_url -b branchname

```
де:
- repo_url url GIT РЕПОЗИТОРІЮ 
- branchname - найменування branch



### <a name="p1.2">1.2. Встановити залежності (npm-пакети)</a> 

```bash
  npm install
```

### <a name="p1.3">1.3. Підготувати файл локальних env змінних</a>

Підготувати конфігурацію keycloak  та  результати конфігурації венсти в локальний файл конфігурації.
Для цього в  каталозі ./server  створити файл **localdev-config.json** з конфігурацією налоштованою на ваш keycloak 

```json

 {
  "KEYCLOAK_CLIENTID": "DemoApp1",
  "KEYCLOAK_REALM": "shdemorealm",
  "KEYCLOAK_URL": "https://[keycloakdomain]/auth"
 }


```
де:
- KEYCLOAK_CLIENTID": ClientID в KeyCloack  
- KEYCLOAK_REALM": Realm в Keycloack
- KEYCLOAK_URL": URL акторизації в KeyCloack

В каталозі /server/config відкоригувати файл local.json з номером порта, який буде слухати сервіс.

### <a name="p1.4">1.4. Запуск додатка</a>

```bash

   npm start
```

## <a name="p2."> 2. АПІ </a>

### <a name="p2.1"> 2.1. http-GET /api/health  Ознака, що сервіс  запустився</a>

- Method http-GET

- Path /api/health

- Response

```json

        {
        "status": "UP"
        }

```

### <a name="p2.2."> 2.2. http-GET /api/todos  Отримати список Todo</a>

- Method http-GET

- Path /api/todos

- http-headers 

```text
    Content-type: application/json
    Authorization: Bearer token
```


- Response

```json
        [{
        "id": 1,
        "name": "todo-1",
        "description": "description todo 1",
        "owner": "usr1"
        }, {
        "id": 2,
        "name": "todo-2",
        "description": "description todo 2",
        "owner": "usr2"
        }, {
        "id": 3,
        "name": "todo-3",
        "description": "description todo 3",
        "owner": "usr4"
        }, {
        "id": 4,
        "name": "todo-4",
        "description": "description todo 4",
        "owner": "usr4"
        }, {
        "id": 5,
        "name": "todo-5",
        "description": "description todo 5",
        "owner": "usr3"
        }]

```



### <a name="p2.3."> 2.3. http-POST /api/todo  Додати нове  Todo у список</a>

- Method http-POST

- Path /api/todo

- http-headers 

```text
    Content-type: application/json
    Authorization: Bearer token
```

- Requset

```json

    {"name": "todo name", "description": "todo description", "owner": "todo username"}

```
- Response OK

```json
    {
    "id": "dcd19c0d-839f-4437-979b-0c8f65910d8e"
    }

```
- Response Error


```json

```

### <a name="p2.4"> 2.4.  http-GET /api/todo/:todoid  Прочитати TODO  за заданим  параметром :id </a>


- Method http-GET

- Path /api/todo/:todoid

- http-headers 

```text
    Content-type: application/json
    Authorization: Bearer token
```

- Response OK

```json
{
  "id": "4",
  "name": "todo-4",
  "description": "description todo 4",
  "owner": "usr4"
}

```

- Response error

```json
{
  "Error": {
    "code": "error",
    "statusCode": 503,
    "description": "Record with id= 8 not found",
    "target": "",
    "stack": "ValidationError: Record with id= 8 not found\n    at C:\\PSHDEV\\PSH-WorkShops\\github-io\\tz-000008-keycloak\\todo_srvc\\tz-000001\\todo_srvc\\server\\server.js:152:19\n    at processTicksAndRejections (internal/process/task_queues.js:95:5)"
  }
}

```



### <a name="p2.5."> 2.5.  http-DELETE /api/todo/:todoid  Видалити TODO  за заданим  параметром :id </a>


- Method http-DELETE

- Path /api/todo/:todoid

- http-headers 

```text
    Content-type: application/json
    Authorization: Bearer token
```


- Response OK

```json
{
  "id": "4"

}

```

- Response error

```json
{
  "Error": {
    "code": "error",
    "statusCode": 503,
    "description": "Record with id= 8 not found",
    "target": "",
    "stack": "ValidationError: Record with id= 8 not found\n    at C:\\PSHDEV\\PSH-WorkShops\\github-io\\tz-000008-keycloak\\todo_srvc\\tz-000001\\todo_srvc\\server\\server.js:152:19\n    at processTicksAndRejections (internal/process/task_queues.js:95:5)"
  }
}

```