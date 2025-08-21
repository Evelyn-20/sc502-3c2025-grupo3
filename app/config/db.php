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
                // Log para debugging
                error_log("Intentando conexión a la base de datos...");
                
                self::$connection = new mysqli(
                    self::$host, 
                    self::$username, 
                    self::$password, 
                    self::$dbname
                );
                
                if (self::$connection->connect_error) {
                    error_log("Error de conexión MySQL: " . self::$connection->connect_error);
                    throw new Exception("Error de conexión a la base de datos: " . self::$connection->connect_error);
                }
                
                // Establecer charset UTF-8
                if (!self::$connection->set_charset("utf8")) {
                    error_log("Error estableciendo charset UTF-8: " . self::$connection->error);
                }
                
                error_log("Conexión a la base de datos exitosa");
                
            } catch (Exception $e) {
                error_log("Database connection error: " . $e->getMessage());
                throw new Exception("Error de conexión a la base de datos: " . $e->getMessage());
            }
        }
        
        return self::$connection;
    }
    
    // Método para probar la conexión
    public static function testConnection() {
        try {
            $conn = self::connect();
            $result = $conn->query("SELECT 1 as test");
            if ($result) {
                return ['success' => true, 'message' => 'Conexión exitosa'];
            } else {
                return ['success' => false, 'message' => 'Error en query de prueba: ' . $conn->error];
            }
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()];
        }
    }
}

// Si el archivo se llama directamente, mostrar estado de conexión
if (basename($_SERVER['PHP_SELF']) == 'db.php') {
    header('Content-Type: application/json');
    echo json_encode(Database::testConnection());
}
?>