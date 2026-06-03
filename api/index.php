<?php
// Set custom session save path to prevent permission issues in C:\xampp\tmp
$session_dir = __DIR__ . '/sessions';
if (!file_exists($session_dir)) {
    @mkdir($session_dir, 0777, true);
}
session_save_path($session_dir);

// Set up sessions with cookie parameters appropriate for cross-origin or local development
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'secure' => false,
    'httponly' => true,
    // Allow cross-origin XHR/fetch requests from local dev (Vite/CRA).
    // Note: for production with HTTPS set 'secure' => true and keep 'samesite' => 'None'.
    'samesite' => 'None'
]);
session_start();

// CORS configuration for local React development support
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    // Allow all localhost and 127.0.0.1 origins in development.
    if (in_array($origin, $allowed_origins) || preg_match('/^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$/', $origin)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: $origin");
    }
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Vary: Origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Register autoloader or require models manually
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/models/Service.php';
require_once __DIR__ . '/models/Booking.php';
require_once __DIR__ . '/models/Destination.php';
require_once __DIR__ . '/models/Companion.php';
require_once __DIR__ . '/models/FAQ.php';

// Helper for file uploads
function uploadImageFile($field, $dir) {
    if (!isset($_FILES[$field]) || $_FILES[$field]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    $tmpPath = $_FILES[$field]['tmp_name'];
    $name = $_FILES[$field]['name'];
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!in_array($ext, $allowed)) {
        throw new Exception("File type '$ext' is not allowed. Choose JPG, PNG, WEBP, or GIF.");
    }
    
    if (!file_exists($dir)) {
        @mkdir($dir, 0777, true);
    }
    
    $newName = uniqid('img_', true) . '.' . $ext;
    if (move_uploaded_file($tmpPath, $dir . $newName)) {
        return $newName;
    }
    throw new Exception("Failed to save uploaded image.");
}

// Router dispatcher
try {
    $controller = $_GET['controller'] ?? '';
    $action = $_GET['action'] ?? '';
    
    // Parse input payloads
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true) ?? [];
    // Merge standard $_POST values for form-data requests (e.g. file uploads)
    $input = array_merge($input, $_POST);

    $response = [];

    // Controller: auth
    if ($controller === 'auth') {
        $userModel = new User();
        
        if ($action === 'register') {
            // Handle Profile Photo Upload if present
            $photo = 'default_profile.jpg';
            if (isset($_FILES['profile_photo'])) {
                $targetDir = __DIR__ . '/../uploads/profiles/';
                $uploaded = uploadImageFile('profile_photo', $targetDir);
                if ($uploaded) {
                    $photo = 'profiles/' . $uploaded;
                }
            }
            $input['profile_photo'] = $photo;
            
            // Validate required fields
            $required = ['email', 'password', 'user_type', 'full_name', 'name_with_initial', 'nic_passport', 'contact_no', 'gender', 'date_of_birth'];
            foreach ($required as $field) {
                if (empty($input[$field])) {
                    throw new Exception("Field '$field' is required.");
                }
            }
            
            $userId = $userModel->register($input);
            $response = ["success" => true, "message" => "Registration successful!", "user_id" => $userId];
            
        } elseif ($action === 'login') {
            if (empty($input['email']) || empty($input['password'])) {
                throw new Exception("Email and Password are required.");
            }
            $user = $userModel->login($input['email'], $input['password']);
            if ($user) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_type'] = $user['user_type'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['full_name'] = $user['full_name'];
                
                $response = [
                    "success" => true,
                    "message" => "Login successful!",
                    "user" => [
                        "id" => $user['id'],
                        "email" => $user['email'],
                        "user_type" => $user['user_type'],
                        "full_name" => $user['full_name'],
                        "profile_photo" => $user['profile_photo']
                    ]
                ];
            } else {
                throw new Exception("Invalid email or password.");
            }
            
        } elseif ($action === 'logout') {
            session_destroy();
            $response = ["success" => true, "message" => "Logged out successfully."];
            
        } elseif ($action === 'me') {
            if (isset($_SESSION['user_id'])) {
                $user = $userModel->getById($_SESSION['user_id']);
                if ($user) {
                    $response = ["success" => true, "user" => $user];
                } else {
                    session_destroy();
                    throw new Exception("Session user not found.");
                }
            } else {
                $response = ["success" => false, "message" => "Not authenticated."];
            }
        } elseif ($action === 'forgot_password') {
            if (empty($input['email'])) {
                throw new Exception("Email is required.");
            }
            // Simple forgot password simulation: generate a temporary code and mail it
            if (!$userModel->existsEmail($input['email'])) {
                throw new Exception("Email address is not registered.");
            }
            $token = rand(100000, 999999);
            $_SESSION['reset_email'] = $input['email'];
            $_SESSION['reset_token'] = $token;
            
            $subject = "Tripzy Password Reset Request";
            $body = "<h2>Tripzy Password Reset</h2>";
            $body .= "<p>We received a request to reset your password. Use the verification token below to reset it:</p>";
            $body .= "<h3>Token: $token</h3>";
            $body .= "<p>If you did not request this, you can ignore this email.</p>";
            
            if (!Mailer::send($input['email'], $subject, $body)) {
                throw new Exception("Failed to send password reset email. Please try again later.");
            }
            $response = ["success" => true, "message" => "Reset code sent to your email."];
            
        } elseif ($action === 'reset_password') {
            if (empty($input['token']) || empty($input['password'])) {
                throw new Exception("Token and Password are required.");
            }
            if (!isset($_SESSION['reset_token']) || $_SESSION['reset_token'] != $input['token'] || !isset($_SESSION['reset_email'])) {
                throw new Exception("Invalid or expired reset token.");
            }
            
            $email = $_SESSION['reset_email'];
            $db = Database::getInstance()->getConnection();
            $password_hash = password_hash($input['password'], PASSWORD_BCRYPT);
            $stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
            $stmt->execute([$password_hash, $email]);
            
            unset($_SESSION['reset_token']);
            unset($_SESSION['reset_email']);
            
            $response = ["success" => true, "message" => "Password reset successfully. You can now log in."];
        } else {
            throw new Exception("Auth action '$action' not found.");
        }
    }

    // Controller: profile
    elseif ($controller === 'profile') {
        if (!isset($_SESSION['user_id'])) {
            throw new Exception("Unauthorized access.");
        }
        $userModel = new User();
        $currentUser = $userModel->getById($_SESSION['user_id']);
        
        if ($action === 'update') {
            $photo = $currentUser['profile_photo'];
            if (isset($_FILES['profile_photo'])) {
                $targetDir = __DIR__ . '/../uploads/profiles/';
                $uploaded = uploadImageFile('profile_photo', $targetDir);
                if ($uploaded) {
                    $photo = 'profiles/' . $uploaded;
                }
            }
            
            $updateData = [
                'full_name' => $input['full_name'] ?? $currentUser['full_name'],
                'name_with_initial' => $input['name_with_initial'] ?? $currentUser['name_with_initial'],
                'contact_no' => $input['contact_no'] ?? $currentUser['contact_no'],
                'profile_photo' => $photo
            ];
            
            if ($userModel->updateProfile($_SESSION['user_id'], $updateData)) {
                $response = ["success" => true, "message" => "Profile updated successfully.", "profile_photo" => $photo];
            } else {
                throw new Exception("Failed to update profile.");
            }
        } else {
            throw new Exception("Profile action '$action' not found.");
        }
    }

    // Controller: destinations
    elseif ($controller === 'destinations') {
        $destModel = new Destination();
        
        if ($action === 'list' || $action === 'search') {
            $filters = [
                'query' => $_GET['query'] ?? '',
                'district' => $_GET['district'] ?? '',
                'interest_category' => $_GET['interest_category'] ?? '',
                'budget_category' => $_GET['budget_category'] ?? '',
                'activity' => $_GET['activity'] ?? ''
            ];
            $data = $destModel->search($filters);
            $response = ["success" => true, "destinations" => $data];
        } elseif ($action === 'get') {
            $id = $_GET['id'] ?? 0;
            $data = $destModel->getById($id);
            if ($data) {
                $response = ["success" => true, "destination" => $data];
            } else {
                throw new Exception("Destination not found.");
            }
        } elseif ($action === 'create') {
            if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
                throw new Exception("Forbidden. Admin access required.");
            }
            $photo = 'default_destination.jpg';
            if (isset($_FILES['image'])) {
                $uploaded = uploadImageFile('image', __DIR__ . '/../uploads/destinations/');
                if ($uploaded) {
                    $photo = 'destinations/' . $uploaded;
                }
            }
            $input['image'] = $photo;
            $destModel->create($input);
            $response = ["success" => true, "message" => "Destination created successfully."];
        } elseif ($action === 'update') {
            if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
                throw new Exception("Forbidden. Admin access required.");
            }
            $id = $_GET['id'] ?? 0;
            $existing = $destModel->getById($id);
            $photo = $existing['image'];
            if (isset($_FILES['image'])) {
                $uploaded = uploadImageFile('image', __DIR__ . '/../uploads/destinations/');
                if ($uploaded) {
                    $photo = 'destinations/' . $uploaded;
                }
            }
            $input['image'] = $photo;
            $destModel->update($id, $input);
            $response = ["success" => true, "message" => "Destination updated successfully."];
        } elseif ($action === 'delete') {
            if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
                throw new Exception("Forbidden. Admin access required.");
            }
            $id = $_GET['id'] ?? $input['id'] ?? 0;
            $destModel->delete($id);
            $response = ["success" => true, "message" => "Destination deleted successfully."];
        } else {
            throw new Exception("Destination action '$action' not found.");
        }
    }

    // Controller: services
    elseif ($controller === 'services') {
        $serviceModel = new Service();
        
        if ($action === 'list') {
            $type = $_GET['type'] ?? null;
            $data = $serviceModel->getAllActive($type);
            $response = ["success" => true, "services" => $data];
        } elseif ($action === 'provider_list') {
            if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'provider') {
                throw new Exception("Unauthorized provider access.");
            }
            $data = $serviceModel->getByProviderId($_SESSION['user_id']);
            $response = ["success" => true, "services" => $data];
        } elseif ($action === 'get') {
            $id = $_GET['id'] ?? 0;
            $service = $serviceModel->getById($id);
            $reviews = $serviceModel->getReviews($id);
            if ($service) {
                $response = ["success" => true, "service" => $service, "reviews" => $reviews];
            } else {
                throw new Exception("Service not found.");
            }
        } elseif ($action === 'create') {
            if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'provider') {
                throw new Exception("Forbidden. Service provider role required.");
            }
            $photo = '';
            if (isset($_FILES['photo'])) {
                $uploaded = uploadImageFile('photo', __DIR__ . '/../uploads/services/');
                if ($uploaded) {
                    $photo = 'services/' . $uploaded;
                }
            } else {
                throw new Exception("Service image photo is required.");
            }
            
            $input['provider_id'] = $_SESSION['user_id'];
            $input['photo'] = $photo;
            
            $serviceModel->create($input);
            $response = ["success" => true, "message" => "Service post created successfully."];
        } elseif ($action === 'update') {
            if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'provider') {
                throw new Exception("Forbidden.");
            }
            $id = $_GET['id'] ?? 0;
            $existing = $serviceModel->getById($id);
            if ($existing['provider_id'] != $_SESSION['user_id']) {
                throw new Exception("Unauthorized to edit this service.");
            }
            
            $photo = $existing['photo'];
            if (isset($_FILES['photo'])) {
                $uploaded = uploadImageFile('photo', __DIR__ . '/../uploads/services/');
                if ($uploaded) {
                    $photo = 'services/' . $uploaded;
                }
            }
            $input['photo'] = $photo;
            $serviceModel->update($id, $input);
            $response = ["success" => true, "message" => "Service post updated successfully."];
        } elseif ($action === 'delete') {
            if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'provider') {
                throw new Exception("Forbidden.");
            }
            $id = $_GET['id'] ?? $input['id'] ?? 0;
            $existing = $serviceModel->getById($id);
            if ($existing['provider_id'] != $_SESSION['user_id']) {
                throw new Exception("Unauthorized to delete this service.");
            }
            $serviceModel->delete($id);
            $response = ["success" => true, "message" => "Service post deleted."];
        } elseif ($action === 'toggle_status') {
            if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'provider') {
                throw new Exception("Forbidden.");
            }
            $id = $input['id'] ?? 0;
            $status = $input['status'] ?? 'enabled';
            $existing = $serviceModel->getById($id);
            if ($existing['provider_id'] != $_SESSION['user_id']) {
                throw new Exception("Unauthorized.");
            }
            $serviceModel->toggleStatus($id, $status);
            $response = ["success" => true, "message" => "Listing status updated."];
        } elseif ($action === 'add_review') {
            if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'tourist') {
                throw new Exception("Only tourists can add reviews.");
            }
            $serviceModel->addReview($_SESSION['user_id'], $input['service_id'], $input['rating'], $input['comment']);
            $response = ["success" => true, "message" => "Review and rating submitted."];
        } else {
            throw new Exception("Services action '$action' not found.");
        }
    }

    // Controller: bookings
    elseif ($controller === 'bookings') {
        if (!isset($_SESSION['user_id'])) {
            throw new Exception("Login required to access bookings.");
        }
        $bookingModel = new Booking();

        if ($action === 'create') {
            if ($_SESSION['user_type'] !== 'tourist') {
                throw new Exception("Only tourists can make bookings.");
            }
            $input['tourist_id'] = $_SESSION['user_id'];
            $res = $bookingModel->create($input);
            if ($res) {
                $response = [
                    "success" => true,
                    "message" => "Booking request submitted successfully! Ref: " . $res['ref_no'],
                    "ref_no" => $res['ref_no'],
                    "price" => $res['total_price']
                ];
            } else {
                throw new Exception("Failed to submit booking request.");
            }
        } elseif ($action === 'tourist_list') {
            $data = $bookingModel->getByTouristId($_SESSION['user_id']);
            $response = ["success" => true, "bookings" => $data];
        } elseif ($action === 'provider_list') {
            if ($_SESSION['user_type'] !== 'provider') {
                throw new Exception("Access denied.");
            }
            $data = $bookingModel->getByProviderId($_SESSION['user_id']);
            $response = ["success" => true, "bookings" => $data];
        } elseif ($action === 'all') {
            if ($_SESSION['user_type'] !== 'admin') {
                throw new Exception("Access denied. Admin only.");
            }
            $data = $bookingModel->getAllBookings();
            $response = ["success" => true, "bookings" => $data];
        } elseif ($action === 'update_status') {
            $id = $input['id'] ?? 0;
            $status = $input['status'] ?? 'pending';
            
            // Authorization check
            $booking = $bookingModel->getById($id);
            if (!$booking) {
                throw new Exception("Booking not found.");
            }
            
            // Either admin, or the provider who owns the service can update status
            $serviceModel = new Service();
            $service = $serviceModel->getById($booking['service_id']);
            if ($_SESSION['user_type'] !== 'admin' && $service['provider_id'] != $_SESSION['user_id']) {
                throw new Exception("Unauthorized to change this booking status.");
            }
            
            $bookingModel->updateStatus($id, $status);
            $response = ["success" => true, "message" => "Booking status updated and customer notified."];
        } else {
            throw new Exception("Booking action '$action' not found.");
        }
    }

    // Controller: companions
    elseif ($controller === 'companions') {
        if (!isset($_SESSION['user_id'])) {
            throw new Exception("Authorization required for companion finder.");
        }
        $compModel = new Companion();

        if ($action === 'create_post') {
            $input['owner_id'] = $_SESSION['user_id'];
            $compModel->createPost($input);
            $response = ["success" => true, "message" => "Travel companion finder post created successfully."];
        } elseif ($action === 'list_posts') {
            $filters = [
                'destination' => $_GET['destination'] ?? '',
                'gender_preference' => $_GET['gender_preference'] ?? ''
            ];
            $posts = $compModel->getPosts($filters);
            $response = ["success" => true, "posts" => $posts];
        } elseif ($action === 'my_posts') {
            $posts = $compModel->getMyPosts($_SESSION['user_id']);
            $response = ["success" => true, "posts" => $posts];
        } elseif ($action === 'get_post') {
            $id = $_GET['id'] ?? 0;
            $post = $compModel->getPostById($id);
            if ($post) {
                $response = ["success" => true, "post" => $post];
            } else {
                throw new Exception("Post not found.");
            }
        } elseif ($action === 'send_request') {
            $input['requester_id'] = $_SESSION['user_id'];
            $compModel->sendRequest($input);
            $response = ["success" => true, "message" => "Request to join travel companion sent successfully."];
        } elseif ($action === 'list_requests') {
            $postId = $_GET['post_id'] ?? 0;
            // Verify owner
            $post = $compModel->getPostById($postId);
            if ($post['owner_id'] != $_SESSION['user_id']) {
                throw new Exception("Access denied.");
            }
            $requests = $compModel->getRequestsForPost($postId);
            $response = ["success" => true, "requests" => $requests];
        } elseif ($action === 'my_requests') {
            $requests = $compModel->getRequestsSentByTourist($_SESSION['user_id']);
            $response = ["success" => true, "requests" => $requests];
        } elseif ($action === 'update_request') {
            $requestId = $input['request_id'] ?? 0;
            $status = $input['status'] ?? 'pending';
            
            $compModel->updateRequestStatus($requestId, $status);
            $response = ["success" => true, "message" => "Companion request updated."];
        } else {
            throw new Exception("Companion action '$action' not found.");
        }
    }

    // Controller: admin
    elseif ($controller === 'admin') {
        if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
            throw new Exception("Forbidden. Admin access required.");
        }
        $userModel = new User();
        
        if ($action === 'stats') {
            $db = Database::getInstance()->getConnection();
            
            // Get user stats
            $users_stmt = $db->query("SELECT user_type, COUNT(*) as count FROM users GROUP BY user_type");
            $user_stats = $users_stmt->fetchAll();
            
            // Get service stats
            $serv_stmt = $db->query("SELECT service_type, COUNT(*) as count FROM services GROUP BY service_type");
            $service_stats = $serv_stmt->fetchAll();
            
            // Get bookings stats
            $book_stmt = $db->query("SELECT status, COUNT(*) as count, SUM(price) as total_earnings FROM bookings GROUP BY status");
            $booking_stats = $book_stmt->fetchAll();
            
            $response = [
                "success" => true,
                "users" => $user_stats,
                "services" => $service_stats,
                "bookings" => $booking_stats
            ];
            
        } elseif ($action === 'pending_admins') {
            $data = $userModel->getPendingAdmins();
            $response = ["success" => true, "pending_admins" => $data];
        } elseif ($action === 'pending_providers') {
            $data = $userModel->getPendingProviders();
            $response = ["success" => true, "pending_providers" => $data];
        } elseif ($action === 'approve_user') {
            $id = $input['id'] ?? 0;
            $status = $input['status'] ?? 'active';
            $userModel->updateStatus($id, $status);
            $response = ["success" => true, "message" => "User registration status has been updated to: $status."];
        } elseif ($action === 'all_users') {
            $data = $userModel->getAllUsers();
            $response = ["success" => true, "users" => $data];
        } else {
            throw new Exception("Admin action '$action' not found.");
        }
    }

    // Controller: faqs
    elseif ($controller === 'faqs') {
        $faqModel = new FAQ();
        if ($action === 'list') {
            $faqs = $faqModel->getAll();
            $response = ["success" => true, "faqs" => $faqs];
        } elseif ($action === 'create') {
            if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
                throw new Exception("Forbidden.");
            }
            $faqModel->create($input['question'], $input['answer']);
            $response = ["success" => true, "message" => "FAQ added successfully."];
        } elseif ($action === 'update') {
            if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
                throw new Exception("Forbidden.");
            }
            $faqModel->update($input['id'], $input['question'], $input['answer']);
            $response = ["success" => true, "message" => "FAQ updated successfully."];
        } elseif ($action === 'delete') {
            if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
                throw new Exception("Forbidden.");
            }
            $id = $_GET['id'] ?? $input['id'] ?? 0;
            $faqModel->delete($id);
            $response = ["success" => true, "message" => "FAQ deleted successfully."];
        } else {
            throw new Exception("FAQ action '$action' not found.");
        }
    }

    // Controller fallback
    else {
        throw new Exception("Controller '$controller' not recognized.");
    }

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
