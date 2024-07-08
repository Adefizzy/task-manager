

## Description
Task Manager is a syetem that allows users to create task and manage tasks

As Users:
1. user can register

```http
      POST /api/v1/auth/register


      Request body = {
      firstName: string
      lastName: string
      email: string
      password: string
    }
```

    
2. user can login via
  ```http POST /api/v1/auth/login 
    Request body = {
      email: string
      password: string
    }
  ```


3. user can create task. task has status; pending, ongoing, completed and cancelled

```http 
  POST /api/v1/tasks

    Request body = {
      title: string
      description: string
      dueDate: string (yyyy-mm-dd i.e 2024-07-06)
    }
```



4. user can get tasks created by him/her. this endpoint is paginated. 
```http
     GET /api/v1/tasks

       QueryParam = {
      fromDate: string (yyyy-mm-dd i.e 2024-07-06),
      toDate: string (yyyy-mm-dd i.e 2024-07-06),
      title: string
      description: string
      page: page number starting from 1;
      size: entries size
    }
```

  

5. user can update task
 NOTE: user can only update a task whose due date has not elapsed. if due date has elapsed, then he can only updated the dueDate

```http
    PATCH /api/v1/tasks/:id

     RequestBody = {
      title: string
      description: string
      dueDate: string (yyyy-mm-dd i.e 2024-07-06)
      status: pending | ongoing | completed
    }
```

   

6. user can delete task 

```http
      DELETE /api/v1/tasks/:id
```


## Installation

create an .env file at the root folder and copy the details in env.example file.

```bash
$ npm install
```




## Running the app

```bash
# development
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


## Authors

- [Adeniji Adefisayo](https://github.com/Adefizzy)



