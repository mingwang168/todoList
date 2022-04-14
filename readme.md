## 一个能够拖拽和双击删除的Todo list
* 技术要点:
1 此版本使用local storage保存数据
~~~
var db=openDatabase('todoData','1','test',100*1024*1024);
db.transaction(function(tx){
tx.executeSql(`CREATE TABLE IF NOT EXISTS todo(id integer primary key autoincrement,todo text)`);
tx.executeSql(`CREATE TABLE IF NOT EXISTS progress(id integer primary key autoincrement,todo text)`);
tx.executeSql(`CREATE TABLE IF NOT EXISTS done(id integer primary key autoincrement,todo text)`);
});
~~~
2 使用js原生的drag and drop功能
