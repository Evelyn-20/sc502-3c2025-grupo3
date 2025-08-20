<?php
require_once 'app/config/db.php';

class Usuario {
    private $db;

    public function __construct() {
        $this->db = Database::connect();
    }

    public function login($cedula, $password) {
        try {
            // Consulta usando los nombres correctos de la tabla
            $stmt = $this->db->prepare("SELECT u.*, r.nombre as rol_nombre FROM usuario u 
                                      INNER JOIN rol r ON u.id_rol = r.id_rol 
                                      WHERE u.cedula_usuario = ? AND u.id_estado = 1");
            $stmt->bind_param("s", $cedula);
            $stmt->execute();
            $result = $stmt->get_result()->fetch_assoc();

            if ($result) {
                // Verificar contraseña
                $passwordMatch = false;
                
                // Verificar si la contraseña está hasheada (más de 20 caracteres)
                if (strlen($result['contrasena']) > 20) {
                    // Contraseña hasheada
                    $passwordMatch = password_verify($password, $result['contrasena']);
                } else {
                    // Contraseña en texto plano (para migración)
                    $passwordMatch = ($password === $result['contrasena']);
                    
                    // Hashear la contraseña para próximas veces
                    if ($passwordMatch) {
                        $this->updatePasswordHash($result['id_usuario'], $password);
                    }
                }

                if ($passwordMatch) {
                    $_SESSION['user'] = [
                        'id' => $result['id_usuario'],
                        'cedula' => $result['cedula_usuario'],
                        'nombre' => $result['nombre'],
                        'apellidos' => $result['apellidos'],
                        'correo' => $result['correo'],
                        'telefono' => $result['telefono'],
                        'rol' => $result['id_rol'],
                        'rol_nombre' => $result['rol_nombre'] ?? ''
                    ];

                    // Determinar redirect según rol
                    $redirect = $this->getRedirectByRole($result['id_rol']);

                    return [
                        'success' => true,
                        'message' => 'Login exitoso',
                        'redirect' => $redirect,
                        'user' => $_SESSION['user']
                    ];
                }
            }

            return [
                'success' => false,
                'message' => 'Credenciales incorrectas'
            ];

        } catch (Exception $e) {
            error_log("Error en login: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error interno del servidor: ' . $e->getMessage()
            ];
        }
    }

    private function getRedirectByRole($rolId) {
        switch ($rolId) {
            case 1: // Administrador
                return '../Administrativo/inicioAdmin.html';
            case 2: // Médico
                return '../Medicos/inicioMedico.html';
            case 3: // Paciente
                return '../Paciente/inicioPaciente.html';
            default:
                return '../index.php';
        }
    }

    private function updatePasswordHash($userId, $password) {
        try {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("UPDATE usuario SET contrasena = ? WHERE id_usuario = ?");
            $stmt->bind_param("si", $hashedPassword, $userId);
            $stmt->execute();
        } catch (Exception $e) {
            error_log("Error actualizando hash de contraseña: " . $e->getMessage());
        }
    }

    public function register($data) {
        try {
            // Validar datos requeridos
            $requiredFields = ['cedula', 'nombre', 'apellidos', 'correo', 'telefono', 'direccion', 'password'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    return ['success' => false, 'message' => "El campo $field es requerido"];
                }
            }

            // Verificar si la cédula ya existe
            if ($this->cedulaExists($data['cedula'])) {
                return ['success' => false, 'message' => 'La cédula ya está registrada'];
            }

            // Verificar si el correo ya existe
            if ($this->emailExists($data['correo'])) {
                return ['success' => false, 'message' => 'El correo ya está registrado'];
            }

            // Hashear contraseña
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

            // Valores por defecto
            $fecha_nacimiento = $data['fecha_nacimiento'] ?? null;
            $id_genero = $data['id_genero'] ?? null;
            $id_estado_civil = $data['id_estado_civil'] ?? null;
            $id_rol = $data['id_rol'] ?? 3; // Por defecto paciente
            $id_estado = 1; // Estado activo

            // Insertar usuario
            $stmt = $this->db->prepare("INSERT INTO usuario 
                (cedula_usuario, nombre, apellidos, correo, telefono, fecha_nacimiento, 
                direccion, contrasena, id_genero, id_estado_civil, id_rol, id_estado) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $stmt->bind_param("ssssssssiihi", 
                $data['cedula'],
                $data['nombre'],
                $data['apellidos'],
                $data['correo'],
                $data['telefono'],
                $fecha_nacimiento,
                $data['direccion'],
                $hashedPassword,
                $id_genero,
                $id_estado_civil,
                $id_rol,
                $id_estado
            );

            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Usuario registrado exitosamente'];
            } else {
                return ['success' => false, 'message' => 'Error al registrar usuario: ' . $stmt->error];
            }

        } catch (Exception $e) {
            error_log("Error en registro: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error interno del servidor: ' . $e->getMessage()];
        }
    }

    private function cedulaExists($cedula) {
        $stmt = $this->db->prepare("SELECT id_usuario FROM usuario WHERE cedula_usuario = ?");
        $stmt->bind_param("s", $cedula);
        $stmt->execute();
        return $stmt->get_result()->num_rows > 0;
    }

    private function emailExists($email) {
        $stmt = $this->db->prepare("SELECT id_usuario FROM usuario WHERE correo = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        return $stmt->get_result()->num_rows > 0;
    }
}