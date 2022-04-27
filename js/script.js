var selected;

var bgColor=["#E5D3E9","#EAD3E6","#F9E6E7","#F6E8CE","#EFEBBC","#CFE5D9","#BAE3DD","#CCF4FE","#D5DCF8"];

//创建localStorage
if(localStorage.getItem("todo")==null){
    localStorage.setItem("todo","")
}
if(localStorage.getItem("progress")==null){
    localStorage.setItem("progress","")
}
if(localStorage.getItem("done")==null){
    localStorage.setItem("done","")
}

function allowDrop(e) {
//在ondragover中一定要执行preventDefault()，否则ondrop事件不会被触发。另外，如果是从其他应用软件或是文件中拖东西进来，尤其是图片的时候，默认的动作是显示这个图片或是相关信息，并不是真的执行drop。此时需要用用document的ondragover事件把它直接干掉。
e.preventDefault();

}

function dragStart(e){
selected=e.target;
e.dataTransfer.setData("Text", selected.innerHTML);
e.dataTransfer.setData("Id", selected.getAttribute("todoId"));
e.dataTransfer.setData("Column", selected.parentNode.id);
e.dataTransfer.effectAllowed = "move";
e.dataTransfer.dropEffect = "move";
//设置当拖拽的时候,被拖拽的东西在原位置消失
setTimeout(() => {
    selected.className = 'invisible';
  }, 0);
}

//拖拽结束时刷新三个列表,dragEnd不管是否成功
function dragEnd(e){

    readList("todo");
    readList("progress");
    readList("done");
    document.getElementById('garbageBin').setAttribute('src','../garbageBinClose.png');
    }

//放下时触发,不管是否成功都会触发
function drop(e){
    //修正在firefox下拖拽后页面跳转的问题
    e.preventDefault();
    e.stopPropagation();
//获取被拖拽项目的信息
let liContent=e.dataTransfer.getData("Text");
let liId=e.dataTransfer.getData("Id");
let liColumn=e.dataTransfer.getData("Column");

//删除原数据库项目
delData(liId,liColumn);
var column;
//如果拖到ul就用ul的id
if(e.target.tagName=='OL'){
    column=e.target.id;
    pushData(liContent.trim(),column.trim());
    //刷新两个列表
readList(column);
readList(liColumn);
    //如果拖到了li就用li的父节点的id
}else if(e.target.tagName=='LI'){
    column=e.target.parentNode.id;
    insertData(liContent.trim(),column.trim(),liId,e.target.getAttribute('todoid'));
    //刷新两个列表
readList(column);
readList(liColumn);
}

}

getList=(column)=>{
    let list=localStorage.getItem(column);
    let listObj
    if(list!==""){
        listObj=JSON.parse(list);
    }else{
        listObj=[]
    }
    return listObj;
}

//删除单条数据的函数
delData=(id,column)=>{
let list=getList(column);
for(let i=0;i<list.length;i++){
    if(list[i].id==id){
        list.splice(i,1);
    }
}
localStorage.removeItem(column);
localStorage.setItem(column,JSON.stringify(list));
}

//追加数据的函数
pushData=(content,column)=>{
    let list=getList(column);
    let idStr=new Date().getTime();
    list.push({id:idStr,todo:content});
    localStorage.removeItem(column);
    localStorage.setItem(column,JSON.stringify(list));
}
//插入数据的函数
insertData=(content,column,liId,targetId) => {
    console.log(content,column,liId,targetId)
    let list=getList(column);
    let location=list.findIndex(item=>item.id==targetId);
    list.splice(location,0,{id:liId,todo:content});
    localStorage.removeItem(column);
    localStorage.setItem(column,JSON.stringify(list));
 }
//从数据库中重新读取数据并重新生成list
readList=(column)=>{
document.getElementById(column).innerHTML="";
let list=getList(column);
for(let i of list){
    const li=document.createElement('li');
    let inner=i.todo;
    inner=inner.replace(/\r\n/g,"<br>");
    li.innerHTML=inner;
    li.setAttribute('draggable',"true");
    li.setAttribute('droppable',"false");
    li.setAttribute('ondragend',"dragEnd(event)");
    li.setAttribute('ondragover',"allowDrop(event)");
    li.setAttribute('ondragstart',"dragStart(event)");
    li.setAttribute('ondblclick',"editItem(event)");
    li.setAttribute('todoId',i.id);
    li.style.backgroundColor=bgColor[i.id%9];
    document.getElementById(column).appendChild(li);
}
}
//刷新三个列表
readList("todo");
readList("progress");
readList("done");

//点新任务的按钮时触发
addTodo=(e)=>{
$('#todo').css('height','calc(100% - 180px)');
$("#submit-button").css('display','block')
$("#cancel-button").css('display','block')
$("#newTask").css('display','block')
$("#newTask").focus()
$("#add-button").css('display','none')
}

//提交新任务
submitTodo=()=>{
    let todo=$("#newTask").val();
    todo=todo.replace(/\r\n/g,"<br>");
    todo=todo.replace(/\n/g,"<br>");
    todo=todo.trim();
    if(todo===""){
        alert("Can not be empty.");
    }else{
        let listObj=getList("todo");
        let idStr=new Date().getTime();
        listObj.push({"id":idStr,"todo":todo})
        listStr=JSON.stringify(listObj);
        localStorage.removeItem("todo");
        localStorage.setItem("todo",listStr)
        readList("todo");
        $('#todo').css('height','calc(100% - 100px)');
        $("#newTask").css('display','none');
        $("#add-button").css('display','block');
        $("#submit-button").css('display','none');
        $("#cancel-button").css('display','none');
        $("#newTask").val("");
    }
}

//取消提交
cancel=(e)=>{
    e.preventDefault();
    $('#todo').css('height','calc(100% - 100px)');
    $("#newTask").css('display','none');
    $("#add-button").css('display','block');
    $("#submit-button").css('display','none');
    $("#cancel-button").css('display','none');
    $("#newTask").val("");
}

//双击一条任务就编辑它
editItem=(el)=>{
    var editItem=document.createElement("textarea");
    editItem.value=el.target.innerText;
    let beforeText=el.target.innerHTML;
    editItem.style.width='100%';
    editItem.style.padding="0";
    editItem.style.margin="0";
    editItem.style.fontSize="1.1rem";
    editItem.style.resize="none";
    editItem.style.border="none";
    let rowN=el.target.innerHTML.split('<br>').length;
    if(editItem.value.length>=50 || rowN>=3){
        editItem.rows="3"
    }
    if(editItem.value.length>=100 || rowN>=4){
        editItem.rows="4"
    };
    editItem.style.overflowY="auto";
    var editCommit=document.createElement('button');
    var editCancel=document.createElement('button');
    var editDiv=document.createElement('div');
    editDiv.style.display="flex";
    editDiv.style.justifyContent="space-around";
    editDiv.style.cursor="default";
    editCommit.innerHTML="Commit";
    editCommit.style.width='80px';
    editCommit.style.height='30px';
    editCommit.style.margin='3px';
    editCommit.style.display='block';
    editCommit.style.fontSize='1.1rem';
    editCommit.style.boxShadow='1px 1px 1px grey';
    editCommit.onclick=()=>{
        let todoId=el.target.getAttribute("todoId");
        if(editItem.value.trim()==""){
            alert("Can not be empty.");
            editItem.focus();
            return;
        }
        editItem.value=editItem.value.replace(/\r\n/g,"<br>");
        editItem.value=editItem.value.replace(/\n/g,"<br>");
        let column=el.target.parentNode.id
        let list=getList(column);
        for(let i of list){
            if(i.id==todoId){
                i.todo=editItem.value;
            }
        }
        localStorage.removeItem(column);
        localStorage.setItem(column,JSON.stringify(list));
        readList(column);
    }
    editCommit.ondblclick=(e)=>{
        e.stopPropagation();
    }
    editCancel.style.width='80px';
    editCancel.innerHTML="Cancel";
    editCancel.style.height='30px';
    editCancel.style.margin='3px';
    editCancel.style.display='block';
    editCancel.style.fontSize='1.1rem';
    editCancel.style.boxShadow='1px 1px 1px grey';
    editCancel.onclick=()=>{
       el.target.innerHTML=beforeText;
       el.target.setAttribute('draggable','true');
       el.target.setAttribute('ondblclick',"editItem(event)");
    }
    editCancel.ondblclick=(e)=>{
        e.stopPropagation();
    }
    el.target.ondblclick=(e)=>{
        e.stopPropagation();
    };
    el.target.style.padding="6px";
    el.target.innerHTML='';
    el.target.appendChild(editItem);
    editDiv.appendChild(editCommit);
    editDiv.appendChild(editCancel);
    el.target.appendChild(editDiv);
    el.target.setAttribute('draggable',"false");
    el.target.ondrop=(e)=>{
        e.stopPropagation();
    };
}
dragLeave=(e)=>{
    e.target.src="../garbageBinClose.png";
}
dragEnter=(e)=>{
    e.target.src="../garbageBinOpen.png";
}