<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/Mailer.php';

class User {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function existsEmail($email) {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch() ? true : false;
    }

    public function register($data) {
        // Calculate age and restrict under 18
        $dob = new DateTime($data['date_of_birth']);
        $today = new DateTime();
        $age = $today->diff($dob)->y;
        if ($age < 18) {
            throw new Exception("You must be 18 years or older to register.");
        }

        // Email address check
        if ($this->existsEmail($data['email'])) {
            throw new Exception("The email address is already registered.");
        }

        // Determine registration status
        $status = 'active'; // Tourists are active by default
        if ($data['user_type'] === 'provider' || $data['user_type'] === 'admin') {
            $status = 'pending';
        }

        // Special Admin Account
        if ($data['email'] === 'dteugee2003@gmail.com') {
            $status = 'active';
        }

        $password_hash = password_hash($data['password'], PASSWORD_BCRYPT);
        
        $sql = "INSERT INTO users (email, password_hash, user_type, full_name, name_with_initial, nic_passport, contact_no, gender, date_of_birth, profile_photo, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            $data['email'],
            $password_hash,
            $data['user_type'],
            $data['full_name'],
            $data['name_with_initial'],
            $data['nic_passport'],
            $data['contact_no'],
            $data['gender'],
            $data['date_of_birth'],
            $data['profile_photo'] ?? 'default_profile.jpg',
            $status
        ]);

        if ($result) {
            $userId = $this->db->lastInsertId();
            
            // Send registration notification via PHPMailer
            $subject = "Welcome to Tripzy Sri Lanka!";
            $body = "<h2>Hello " . htmlspecialchars($data['full_name']) . ",</h2>";
            $body .= "<p>Thank you for registering on Tripzy - Smart Tourism Management and Booking System for Sri Lanka.</p>";
            if ($status === 'pending') {
                $body .= "<p>Your account is currently <strong>pending verification/approval</strong>. We will notify you via email as soon as an administrator approves your account.</p>";
            } else {
                $body .= "<p>Your account is now active! You can log in and start using our platform.</p>";
            }
            $body .= "<p>Warm Regards,<br>The Tripzy Team</p>";
            
            Mailer::send($data['email'], $subject, $body);

            return $userId;
        }
        return false;
    }

    public function login($email, $password) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            if ($user['status'] === 'pending') {
                throw new Exception("Your account is pending admin approval.");
            }
            if ($user['status'] === 'rejected') {
                throw new Exception("Your account approval has been rejected.");
            }
            return $user;
        }
        return false;
    }

    public function getById($id) {
        $stmt = $this->db->prepare("SELECT id, email, user_type, full_name, name_with_initial, nic_passport, contact_no, gender, date_of_birth, profile_photo, status, created_at FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function updateProfile($id, $data) {
        $sql = "UPDATE users SET full_name = ?, name_with_initial = ?, contact_no = ?, profile_photo = ? WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['full_name'],
            $data['name_with_initial'],
            $data['contact_no'],
            $data['profile_photo'],
            $id
        ]);
    }

    public function getPendingAdmins() {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE user_type = 'admin' AND status = 'pending'");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getPendingProviders() {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE user_type = 'provider' AND status = 'pending'");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function updateStatus($id, $status) {
        $stmt = $this->db->prepare("UPDATE users SET status = ? WHERE id = ?");
        $result = $stmt->execute([$status, $id]);

        if ($result && ($status === 'active' || $status === 'rejected')) {
            $user = $this->getById($id);
            if ($user) {
                $subject = "Tripzy Account Approval Updates";
                $body = "<h2>Hello " . htmlspecialchars($user['full_name']) . ",</h2>";
                $body .= "<p>Your Tripzy user profile has been updated to: <strong>" . strtoupper($status) . "</strong>.</p>";
                if ($status === 'active') {
                    $body .= "<p>You are now authorized to log in and start providing or managing services.</p>";
                } else {
                    $body .= "<p>We regret to inform you that your registration request was rejected by our administrator panel.</p>";
                }
                $body .= "<p>Best Regards,<br>The Tripzy Team</p>";
                Mailer::send($user['email'], $subject, $body);
            }
        }
        return $result;
    }

    public function getAllUsers() {
        $stmt = $this->db->prepare("SELECT id, email, user_type, full_name, name_with_initial, nic_passport, contact_no, gender, date_of_birth, status FROM users WHERE user_type != 'admin' OR email != 'dteugee2003@gmail.com'");
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
