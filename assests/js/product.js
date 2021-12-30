var db = window.openDatabase("shark_shop", "1.0", "Shark Shop", "200000");
window.onload = on_load();

function on_load(){
    update_cart_quantity();


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

        //     query = ` INSERT INTO account (username, password, status) VALUES (?,?,1) `;

        // tx.executeSql(query,["nguyendz", 12345],fetch_transaction_success("nguyendz"),transaction_error);

    });
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

//test data
function fetch_database() {
    db.transaction(function (tx) {
        var query = "INSERT INTO category (name) VALUES (?)"

        tx.executeSql(query,["Pants"], fetch_transaction_success("Pants"), transaction_error)
        tx.executeSql(query,["T-Shirt"], fetch_transaction_success("T-Shirt"), transaction_error)
        tx.executeSql(query,["Hoodies"], fetch_transaction_success("Hoodies"), transaction_error)

        var query = "INSERT INTO product (name, description, price, category_id) VALUES (?,?,?,?)"

        tx.executeSql(query,["SAD SIGNATURE SHIRT-DTXT","", 12, "T-Shirt"], fetch_transaction_success("T-Shirt"), transaction_error)
        tx.executeSql(query,["Sadboiz T-Shirt-KAMZ","", 12, "T-Shirt"], fetch_transaction_success("T-Shirt"), transaction_error)
        tx.executeSql(query,["SADTAGRAM Hoodie-SHED","", 12, "Hoodies"], fetch_transaction_success("Hoodies"), transaction_error)
    });
}

function fetch_transaction_success(name) {
    log("INFO",`insert ${name} successfully`)
}

function get_products () {
    db.transaction(function(tx){
        var query = "SELECT * FROM product";

        tx.executeSql(query,[],
            function(tx, result){
                log("INFO","Get a list of product successfully. ")
                show_product(result.rows);
            },transaction_error)
    });
}

function show_product(products) {
    var product_list = document.getElementById("product_list");
    var i = 1;
    for(var product of products) {
            product_list.innerHTML +=`<div class="product_1">
                                    <a href=""><img src="/assests/img/sp${i}.jpg"></a>
                                    <div class="shirt-name">${product.name}</div>
                                    <div class="price">${product.price}$</div>
                                    <button onclick="add_to_card(this.id)" class="add" id="${product.id}">Add to Cart</button>
                                </div>`
        i = i + 1;
    } 
}
function add_to_card(product_id) {
    //Add a product to cart in database.
    var account_id = localStorage.getItem("account_id");
    db.transaction(function(tx) {
        var query = "SELECT quantity FROM cart WHERE account_id = ? AND product_id = ?";

        tx.executeSql(query,[account_id,product_id],
            function(tx,result) {
            if(result.rows[0]) {
                update_cart_database(product_id, result.rows[0].quantity + 1);
            } else {
                add_cart_database(product_id);
            }
            alert("Add product successfully.")
        },transaction_error);
    });
    
    //Update product quantity in <span> tag.
}

function add_cart_database(product_id) {
    var account_id = localStorage.getItem("account_id");
    db.transaction(function(tx) {
        var query = "INSERT INTO cart (account_id, product_id, quantity) VALUES (?,?,?)";

        tx.executeSql(query,[account_id, product_id, 1],
            function(tx,result) {
            log(`INFO`,`Insert cart successfully.`);
            update_cart_quantity();
        },
        transaction_error);
    });
}

function update_cart_database(product_id, quantity) {
    var account_id = localStorage.getItem("account_id");
    
    db.transaction(function(tx) {
        var query = "UPDATE cart SET quantity = ? WHERE account_id = ? AND product_id = ?";

        tx.executeSql(query, [quantity, account_id, product_id],
            function(tx,result) {
            log(`INFO`,`Update cart successfully.`);
            update_cart_quantity();
        },
        transaction_error);
    });
}

function update_cart_quantity() {
    var account_id = localStorage.getItem("account_id");
    db.transaction(function(tx) {
    var query = "SELECT SUM(quantity) AS total_quantity FROM cart WHERE account_id = ?";

    tx.executeSql(query, [account_id], function(tx,result) {
        if(result.rows[0].total_quantity) {
            document.getElementById("cart-quantity").innerText = result.rows[0].total_quantity;
        } else {
            document.getElementById("cart-quantity").innerText = 0;
        }
    }, transaction_error);
});
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

function get_cart_list () {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function(tx) {
        var query = `SELECT p.id, c.quantity, p.name, p.price
        FROM product p, cart c WHERE p.id = c.product_id AND c.account_id = ?
        ORDER BY (p.name)`;

        tx.executeSql(query,[account_id],
            function(tx, result){
                log("INFO","Get a list of product in cart successfully. ")
                show_cart_list(result.rows);
            },transaction_error)
    });
}

function show_cart_list(products) {
    var total = 0;
    var cart_list = document.getElementById("cart-list");
    for(var product of products) {
        var amount = product.quantity * product.price;
        total += amount;
        cart_list.innerHTML += `
        <tr id="cart-list-item-${product.id}">
                <td id="cart-list-name-${product.id}">${product.name}</td>
                <td>${product.quantity}</td>
                <td>${product.price}</td>
                <td>${amount}</td>
            <td>
                <button onclick="delete_cart_item(this.id)" id="${product.id}" class="btn btn-danger btn-sm">
                    Delete
                </button>
            </td>
        </tr>`
    }

    cart_list.innerHTML += `
        <tr>
            <td></td>
            <td></td>
            <th>Total</th>
            <td><strong>${total}</strong></td>
            <td></td>
        </tr>`
}

function delete_cart_item(product_id) {
    var account_id = localStorage.getItem("account_id");
    db.transaction(function(tx) {
        var query = `DELETE FROM cart WHERE account_id = ? AND product_id = ?`;

        tx.executeSql(query,[account_id, product_id],function(tx,result) {
            var product_row = document.getElementById(`cart-list-item-${product_id}`);
            var product_name = document.getElementById(`cart-list-name-${product_id}`);

            product_row.outerHTML = "";

            var message = `Delect "${product_name.innerText}" successfully.`;
            log(`INFO`,message);
            alert(message);

            update_cart_quantity();
        },transaction_error);
    });
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