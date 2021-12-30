var db = window.openDatabase("shark_shop", "1.0", "Shark Shop", "200000");
function on_load(){
    initialize_database();

    var account_id = localStorage.getItem("account_id");
    if(account_id != "") {
        login_success();
    } else {
        log_out();
    }
}

function initialize_database() {
    db.transaction(function(tx) {
        var query = `CREATE TABLE IF NOT EXISTS account(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            firstname TEXT NULL,
            lastname TEXT NULL,
            birthday REAL NULL,
            phone TEXT NULL,
            status INTEGER NOT NULL)`;
        
        tx.executeSql(query,[],transaction_success("account"),transaction_error);

        query = `CREATE TABLE IF NOT EXISTS cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                FOREIGN KEY (product_id) REFERENCES product(id),
                FOREIGN KEY (account_id) REFERENCES account(id))`;
            
            tx.executeSql(query,[],transaction_success("cart"),transaction_error);
                
        query = `CREATE TABLE IF NOT EXISTS category (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT NULL)`;
                
            tx.executeSql(query,[],transaction_success("category"),transaction_error);

        query = `CREATE TABLE IF NOT EXISTS product (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT NULL,
                price REAL NOT NULL,
                category_id INTEGER NOT NULL,
                FOREIGN KEY (category_id) REFERENCES category(id))`;
            
            tx.executeSql(query,[],transaction_success("product"),transaction_error);
    });
}

function fetch_transaction_success(name) {
    log("INFO",`insert ${name} successfully`)
}

function transaction_success(table_name) {
    log("INFO",`Create table '${table_name}' successfully.`)
}

function log(type, message) {
    console.log (`[${type}] ${message}`);
}

function transaction_error(tx, error) {
    log("ERROR",`[SQL Error] ${error.code},[Error] ${error.message}.`);
}

// tạo even submit
var frm_login = document.getElementById("frm_login");
frm_login.onsubmit = login;
//Login
function login(e) {
    e.preventDefault();

    // Get input form user
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    db.transaction(function(tx) {
        var query = "SELECT * FROM account WHERE username = ? AND password = ?";

        tx.executeSql(query, [username, password], function(tx,result) {
            if(result.rows[0]) {

                localStorage.setItem("account_id", result.rows[0].id);
                localStorage.setItem("account_username", result.rows[0].username);

                login_success();
                alert("Login successfully.")
            }
            else {

                log_out();

                alert("Login failed.");
            }
        }, transaction_error)
    });
}

function login_success() {
    var username = localStorage.getItem("account_username");
    var account = document.getElementById("account-info");
    account.innerHTML = `<button style="padding:8px; color:#333;border:0;background-color:#fff; font-size:16px"disabled>
    Hello,${username}
    </button>
    <button onclick="log_out()" class="log-out" id="btn-log-out" style="padding:4px;">Log Out</button>`
}

function log_out() {
    localStorage.setItem("account_id", "");
    localStorage.setItem("account_name", "");
    var account = document.getElementById("account-info");
    account.innerHTML = `<a href="#frm_login"><i class="ti-user"></i></a>`
}



// tạo even submit
var frm_sign_up = document.getElementById("frm-sign-up");
frm_sign_up.onsubmit = register;
function register(e) {
    e.preventDefault();

    // Get input form user
    var username = document.getElementById("user").value;
    var password = document.getElementById("pass").value;

    db.transaction(function(tx) {
        var query = "INSERT INTO account(username, password, status) VALUES (?,?,1)";

        tx.executeSql(query, [username, password], function(tx,result) {
                localStorage.setItem("account_id", result.rows.id);
                localStorage.setItem("account_username", result.rows.username);
                alert("Register successfully.")
        }, function(tx,error) {
            alert("Register failed, username already exists.")
            transaction_error;
        })
    });
}