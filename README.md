# todo_srvc
Node.js exptress  REST API with keycloak security


## Запуск локально



### Налаштування env var

В  каталозі ./server  створити файл **localdev-config.json** з конфігурацією налоштованою на ваш keycloak 

```json

 {
  "KEYCLOAK_CLIENTID": "DemoApp1",
  "KEYCLOAK_REALM": "shdemorealm",
  "KEYCLOAK_URL": "https://[keycloakdomain]/auth"
 }


```



## АПІ

### http-GET /api/health  Ознака, що сервіс  запустився

- Method http-GET

- Path /api/health

- Response

```json

        {
        "status": "UP"
        }

```

### http-GET /api/todos  Отримати список Todo

- Method http-GET

- Path /api/todos

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



### http-POST /api/todo  Додати нове  Todo у список

- Method http-POST

- Path /api/todo

- http-headers 

```text
    Content-type: application/json
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

### http-GET /api/todo/:todoid  Прочитати TODO  за заданим  параметром :id


- Method http-GET

- Path /api/todo/:todoid

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



### http-DELETE /api/todo/:todoid  Видалити TODO  за заданим  параметром :id


- Method http-DELETE

- Path /api/todo/:todoid

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