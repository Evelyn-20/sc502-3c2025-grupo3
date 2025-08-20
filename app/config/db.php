<?php
class Database {
    private static $host = 'localhost';
    private static $dbname = 'proyecto_sistema_citas';
    private static $username = 'root';
    private static $password = 'r0556U1-25.20-3k';
    private static $connection = null;

    public static function connect() {
        if (self::$connection === null) {
            try {
                self::$connection = new mysqli(
                    self::$host, 
                    self::$username, 
                    self::$password, 
                    self::$dbname
                );
                
                if (self::$connection->connect_error) {
                    error_log("Error de conexión MySQL: " . self::$connection->connect_error);
                    throw new Exception("Error de conexión a la base de datos");
                }
                
                // Establecer charset UTF-8
                self::$connection->set_charset("utf8");
                
            } catch (Exception $e) {
                error_log("Database connection error: " . $e->getMessage());
                throw new Exception("Error de conexión a la base de datos: " . $e->getMessage());
            }
        }
        
        return self::$connection;
    }
}
?>