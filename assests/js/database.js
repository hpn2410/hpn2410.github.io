var db = window.openDatabase("shark_shop", "1.0", "Shark Shop", "200000");
window.onload = on_load();

function on_load(){
    initialize_database();
    //fetch_database();
    //get_products();
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

        // var query = "INSERT INTO product (name, description, price, category_id) VALUES (?,?,?,?)"

        // tx.executeSql(query,["PRODUCT 01","DESCRIPTION 01", 20000,1], fetch_transaction_success("CATEGORY 01"), transaction_error)
        // tx.executeSql(query,["PRODUCT 02","DESCRIPTION 02", 50000,1], fetch_transaction_success("CATEGORY 02"), transaction_error)
        // tx.executeSql(query,["PRODUCT 03","DESCRIPTION 03", 100000,2], fetch_transaction_success("CATEGORY 03"), transaction_error)
        // tx.executeSql(query,["PRODUCT 04","DESCRIPTION 04", 200000,2], fetch_transaction_success("CATEGORY 04"), transaction_error)
        // tx.executeSql(query,["PRODUCT 05","DESCRIPTION 05", 500000,3], fetch_transaction_success("CATEGORY 05"), transaction_error)
    });
}

function fetch_transaction_success(name) {
    log("INFO",`insert ${name} successfully`)
}