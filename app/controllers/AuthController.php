<?php
require_once 'app/models/Usuario.php';

class AuthController {
    public function login() {
        // Verificar que sea POST
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
            return;
        }

        // Validar datos de entrada
        $cedula = trim($_POST['cedula'] ?? '');
        $password = trim($_POST['password'] ?? '');

        if (empty($cedula) || empty($password)) {
            echo json_encode(['status' => 'error', 'message' => 'Por favor complete todos los campos']);
            return;
        }

        $usuario = new Usuario();
        $result = $usuario->login($cedula, $password);

        if ($result['success']) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Login exitoso',
                'redirect' => $result['redirect'],
                'user' => $result['user']
            ]);
        } else {
            echo json_encode([
                'status' => 'error', 
                'message' => $result['message']
            ]);
        }
    }

    public function register() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
            return;
        }

        $usuario = new Usuario();
        $result = $usuario->register($_POST);

        echo json_encode($result);
    }

    public function logout() {
        session_start();
        session_unset();
        session_destroy();
        
        if (isset($_COOKIE[session_name()])) {
            setcookie(session_name(), '', time() - 3600, '/');
        }
        
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        // Cambiar la ruta - quitar el path completo
        header('Location: /sc502-3c2025-grupo3/Registro/Login.php?logout=1');
        exit;
    }
}