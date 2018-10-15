var express        =        require("express");
var bodyParser     =        require("body-parser");
var app            =        express();
var fs = require('fs');
var crypto= require('crypto');
var algorithm = 'aes-256-ctr';
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(express.cookieParser());

//----global vars-----
//var DBMaxIndex=0;
//var DB;
// Nodejs encryption with CTR
/*var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'UltraSecretPassWordHaaHaa';*/

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
 
function makeToken(size) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < size; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


function compareStrings(st1,st2){
			var compare=false;
			var n=0;
            console.log(st1+"="+st2+" size:"+st1.length+":"+st2.length);
			for(i=0;i<st1.length;i++){
				if(st1[i]==st2[i])
					n++;
				else
					break;
			}
			if(n==st1.length) {//&& st1.length==st2.length)//this does not work because the password is not a string is something else because fs.ReadFile returns bytes.
				compare=true;
            }
			return compare	
}
function parser(data){
    var d={};
    var vars=data.split("&");
    vars.forEach(function(variable){
                    var name=variable.split("=")[0];
                    var value=variable.split("=")[1];
                    d[name]=value;
                                   
                });
    return d;
}
/*function callback(variable){
    return variable;
}*/
function loadDB(){
   
    var DB = fs.readFileSync("./DB.txt",'utf8');
    //console.log(DB);
    return DB;
}

async function getMaxDBIndex(DB){
    var DBLines=DB.split('\n');
    var max_id;
    
    //console.log('DB length:'+DBLines.length);
    if(DBLines.length>1){
        
        for(i=0;i<DBLines.length;i++){
            var D=decrypt(DBLines[i]);
            var id=parseInt(D.split('\t')[0]);
            //console.log('line:'+D);
            //console.log('id:'+D.split('\t')[0]);
            if(i==0){
                max_id= id;
            }
            else{
                if(id>=max_id){
                    max_id=id;
                }
            }
        }
        max_id++;
        console.log('maxid:'+max_id);
        return max_id;
    }
    else{
        return  0;
    }
}
async function AppendLineToDB(new_data){
    var success;
     fs.appendFile('DB.txt', new_data, function (err) {
        if (err) {
        // append failed
            console.log('Fail to save record in DB!');
            success=false
        } else {
        // done
            console.log('record saved with success!');
            success=true;
        }
    });
    //console.log(success);
    return success;
}
function WriteDB(DBlines){
    var DB_to_string='';
    for(i=0;i<DBlines.length;i++){
        if(DBlines[i]!=''){
            
            DB_to_string+=DBlines[i]+'\n';
        }
    }
    //console.log(DB_to_string);    
    fs.writeFile("DB.txt",DB_to_string,function(err){
        if(err) {
            return console.log(err);
        }
        //console.log("DB was saved!");
    });
}







//Main sort off------------------



var server_token=makeToken(30);
app.get('/', function(req, res) {
    //res.sendFile needs absolut path which means C://.../... __dirname is the working directory
    res.sendFile(__dirname+'/sitepage.html');
});
app.get('/search_engine.js',function(req,res){
    res.sendFile(__dirname+'/search_engine.js');
})
app.get('/InsertRecord.html', function(req, res) {
    //res.sendFile needs absolut path which means C://.../... __dirname is the working directory
    res.sendFile(__dirname+'/InsertRecord.html');
});
app.get('/GetRecord.html', function(req, res) {
    //res.sendFile needs absolut path which means C://.../... __dirname is the working directory
    res.sendFile(__dirname+'/GetRecord.html');
});
app.get('/ChangeMasterPass.html', function(req, res) {
    //res.sendFile needs absolut path which means C://.../... __dirname is the working directory
    res.sendFile(__dirname+'/ChangeMasterPass.html');
});
app.post('/token',function(req,res){
    //console.log(req.body);
    res.writeHead(200);
    res.end(server_token);
});
app.post('/login',function(req,res){
    //console.log(req.body);
    //var username=req.body.username;
    var pass=req.body.pass;
    var token=req.body.token;
    crypto= require('crypto'),
    algorithm = 'aes-256-ctr',
    password = pass;
    if(token.localeCompare(server_token)==0){
        
        res.sendFile(__dirname+'/restricted.html');
    }
    else{
        res.writeHead(200);
        res.end('Not Valid User!');
    }
    
});
app.post('/insert',async function(req,res){
    //console.log(req.body);
    //var username=req.body.username;
    var max_index;
    
        
    max_index=await getMaxDBIndex(loadDB());
    //console.log('Max Index:'+max_index);
    
    
     
    //console.log('max_index:'+max_index);
    var password=req.body.pass;
    var page=req.body.page;
    var user=req.body.user;
    var record=max_index+'\t'+page+'\t'+user+'\t'+password;
    //console.log('pass='+pass);
    var success=AppendLineToDB(encrypt(record)+'\n');
    //console.log(success);
    res.writeHeader(200);
    if(success){
        
        res.end('<h1><font color="green">Record Saved With Success</font></h1>');
    }
    else{
        res.end('<h1><font color="red">Failed to Save Record!</font></h1>');
    }
    
});
app.post('/getPages',function(req,res){
    //console.log(req.body);
    DB=loadDB();
    var lines=DB.split('\n');
    res.writeHeader(200);
    var dir={};
    lines.forEach(function(line){
        //console.log(line);
        var D=decrypt(line);
        var page=D.split('\t')[1];
        dir[page]=page;
        //res.write('<p onclick="Select(this.innerHTML)">'+content[0]+'</p>\t');
    });
    
    for(page in dir){
        if(page!='' && page!='undefined'){
            
            res.write('<div ><p onclick="Select(this.innerHTML,this.parentNode)">'+page+'</p></div>\t');
        }
    }
    
    res.end();
});
app.post('/get',function(req,res){
    //console.log(req.body);
    //var username=req.body.username;
    var page=req.body.page;
    DB=loadDB();
    var lines=DB.split('\n');
    var output='';
    
    //console.log(pass+'  '+lines[1]);
    var index=0;
    lines.forEach(function(line){
        var D=decrypt(line);
        if(page.localeCompare(D.split('\t')[1])==0){
            output+='<div align="center">';
           
            output+='Username:<br><input id="'+index+'" name="'+D.split('\t')[0]+'" style="opacity:0;height:0px;" type="text" value="'+D.split('\t')[2]+'"><br>';
            index++;
            output+='<button  onclick="Copy('+(index-1)+','+index+')">Copy Username</button><p id="'+index+'"></p><br>';
            index++;
            output+='Password:<br><input id="'+index+'" type="text" style="opacity:0;height:0px;" value="'+D.split('\t')[3]+'" ><br>';
            index++;
            output+='<button  onclick="Copy('+(index-1)+','+index+')">Copy Password</button><p id="'+index+'"></p><br>';
            //inputs in index
            output+='<button style="width:100px" onclick="Edit('+(index-3)+','+(index-1)+',this)" >Edit</button>';
            output+='<button style="width:100px" onclick="Delete('+(index-3)+',this)">Delete</button><br>';
            index++;
            output+='<div style="background-color:black;width:100%;height:10px;"></div>';
            output+='</div>';
            
        }
    });
    res.writeHeader(200);
    if(output==''){
        res.end('<h1 style="text-align:center"><font color="red">Such Page Does Not Exists!</font></h1>');
    }
    else{
        
        res.end(output);
    }
    
});

app.post('/edit',function(req,res){
    //console.log(req.body);
    //console.log('edit');
    var id=req.body.id;
    var username=req.body.user;
    var password=req.body.pass;
    
    var newDB=[];
    var DB=loadDB();
    var DBlines=DB.split('\n');
    DBlines.forEach(function(line){
        var D=decrypt(line);
        if(id.localeCompare(D.split('\t')[0])==0 ){
            //edit record
            var record=id+'\t'+D.split('\t')[1]+'\t'+username+'\t'+password;
            newDB.push(encrypt(record));
        }
        else{
            newDB.push(encrypt(D));
        }
    });
    
    //write on file new DB;
    WriteDB(newDB);
    res.writeHead(200);
    res.end('Record Successfully Edit!');
});

app.post('/delete',function(req,res){
    //console.log(req.body);
    //console.log('delete');
    var id=req.body.id;
    
    
    var newDB=[];
    var DB=loadDB();
    var DBlines=DB.split('\n');
    DBlines.forEach(function(line){
        var D=decrypt(line);
        if(id.localeCompare(D.split('\t')[0])==0 ){
            //does not put in the new DB
        }
        else{
            newDB.push(encrypt(D));
        }
    });
    //write on file new DB;
    WriteDB(newDB);
    res.writeHead(200);
    res.end('Record Successfully Deleted!');
});

app.post('/change_pass',function(req,res){
    //console.log(req.body);
    //console.log('change_pass');
    var pass=req.body.pass;
    var old_pass=req.body.old_pass;
    
    crypto= require('crypto'),
    algorithm = 'aes-256-ctr',
    password = old_pass;
    
    
    var currentdecryptDB=[];
    var newDB=[];
    var DB=loadDB();
    var DBlines=DB.split('\n');
    DBlines.forEach(function(line){
        var D=decrypt(line);
        currentdecryptDB.push(D);
    
    });
    
    //change crypto pass
    crypto= require('crypto'),
    algorithm = 'aes-256-ctr',
    password = pass;
    currentdecryptDB.forEach(function(line){
        var E=encrypt(line);
        newDB.push(E);
    });
    //write on file new DB;
    WriteDB(newDB);
    //res.writeHead(302,{Location:'/restricted.html'});
    res.writeHead(200);
    res.end('<h1>Master Password Changed with Success!</h1><br><a href="/"><h2><font color="red">Click here to Go to the Initial Page. Insert the new password again to use it!</font></h2></a>');
});



app.get('/exit',function(req,res){
    res.writeHead(200);
    //res.end('<h1>Exit Successfully!</h1><br><h1><font color="red">Please Close Browser, so that, hackers can\'t turn on the server and reload post requests!</font></h1>');
    res.end('<h1>Exit Successfully!</h1>');
    process.exit(1);
});

app.listen(80, function() {
  console.log('App listening on port 80!');
});