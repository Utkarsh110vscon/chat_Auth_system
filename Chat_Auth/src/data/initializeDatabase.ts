import { createUserTable,createVerifyTable } from "./createTable";

const initializeDatabase= async() => {
    try{
        await createUserTable();
        await createVerifyTable();
        console.log("All tables are initialized successfully!")
    }catch(error){
        console.log("Error initialized table: ",error)
    }
}

export default initializeDatabase;