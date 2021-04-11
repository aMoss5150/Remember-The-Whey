# Remeber the Whey
Remember the Whey is a fitness organizational tool.  It enables a user to categorize and keep track of workouts by creating       customizable lists.  The user is also given the ability to customize each excercise or task on their custom list, while also       having easy access to a summary of the list or task info. 
![loginscreen](https://user-images.githubusercontent.com/73197963/114289924-964f4680-9a49-11eb-94a8-72cd62af26e5.JPG)

  
Link to live site
Screenshots of your app in action (once completed)
Technical implementation details
Anything you had to stop and think about before building
Descriptions of particular challenges
Snippets or links to see code for these
  
  
## MVP
  * Ability to create new users and have user login with authorization
  * Ability to login as a demo user with full access to features
  * Users can create, update, delete a list unique to the user  
  * Users can create, update, delete a task to/from their list
  * Users have access to a summary of the list or task (excercise?)
  * Users can search through all excercises or tasks

## BONUS / STRETCH GOALS
  * Autocomplete SmartAdd of task properties
  * Subtasks
  * Tag system
  
## TECHNOLOGIES USED
  * Javascript
  * Express
  * Sequelize
  * PSQL Database
  * CSS
  * HTML
  
## DATABASE SCHEMA

![dataschema](https://user-images.githubusercontent.com/73197963/114215426-94935f00-9933-11eb-84ec-4680664f90ce.JPG)

## TABLE USERS
  * id (integer, primary key, not null)
  * firstName (string, not null)
  * lastName (string, not null)
  * email (string, unique, not null)
  * hashPW (string, not null)
  * created_at (dateTime, not null)
  * updated_at (dateTime, not null)
## TABLE LISTS
  * id (integer, primary key)
  * userId (integer, not null, foreign key)
  * name (string, not null)
  * created_at (dateTime, not null)
  * updated_at (dateTime, not null)
## TABLE TASKS
  * id (integer, primary key, not null)
  * name (string, not null)
  * complete (boolean, not null, default false)
  * date (dateOnly)
  * notes (text)
  * listId (integer, not null, foreign key)
  * sets (integer, not null)
  * reps (integer)
  * duration (integer)
  * repeats (integer, not null, default false)
  * created_at (dateTime, not null)
  * updated_at (dateTime, not null)

## BACKEND ROUTES    
  ### USERS
   * log-in user (GET & POST)
   * sign-up user (GET & POST)
   * log-out user (POST)
  ### LISTS
   * get all lists (GET)
   * get specific list (GET)
   * create new list (POST)
   * update specific list (PUT)
   * delete a list (DELETE)
  ### TASKS
   * get all tasks (GET)
   * get specific task (GET)
   * create new task (POST)
   * update task (PUT)
   * update task properties (PATCH)
   * delete task (DELETE)
