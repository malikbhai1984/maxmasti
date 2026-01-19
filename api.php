<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit(0);

$host = "localhost";
$db_name = "u893493446_movie";
$username = "u893493446_shahid";
$password = "Sj4143086*";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(["error" => "DB Failed: " . $e->getMessage()]));
}

$action = $_GET['action'] ?? '';

switch($action) {
    case 'cats':
        $stmt = $conn->query("SELECT id, name FROM categories ORDER BY name");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'movies':
        $stmt = $conn->query("SELECT * FROM movies ORDER BY id DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'add-cat':
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            $stmt = $conn->prepare("INSERT IGNORE INTO categories (name) VALUES (?)");
            $stmt->execute([$data['name'] ?? '']);
            echo json_encode(["success" => true]);
        }
        break;

    case 'add-post':
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $upload_dir = 'uploads/';
            if (!file_exists($upload_dir)) mkdir($upload_dir, 0755, true);
            
            $img_name = "";
            if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
                $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
                if (in_array($ext, ['jpg','jpeg','png','webp'])) {
                    $img_name = $upload_dir . time() . '_' . uniqid() . '.' . $ext;
                    move_uploaded_file($_FILES['image']['tmp_name'], $img_name);
                    chmod($img_name, 0644);
                }
            }
            
            $stmt = $conn->prepare("INSERT INTO movies (title, cat, img, link) VALUES (?, ?, ?, ?)");
            $stmt->execute([$_POST['title'], $_POST['cat'], $img_name, $_POST['link']]);
            echo json_encode(["success" => true]);
        }
        break;

    // **NEW: UPDATE POST**
    case 'update-post':
        if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['id'])) {
            $id = $_GET['id'];
            $upload_dir = 'uploads/';
            if (!file_exists($upload_dir)) mkdir($upload_dir, 0755, true);
            
            $img_name = $_POST['old_img'] ?? '';
            if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
                $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
                if (in_array($ext, ['jpg','jpeg','png','webp'])) {
                    $img_name = $upload_dir . time() . '_' . uniqid() . '.' . $ext;
                    move_uploaded_file($_FILES['image']['tmp_name'], $img_name);
                }
            }
            
            $stmt = $conn->prepare("UPDATE movies SET title=?, cat=?, img=?, link=? WHERE id=?");
            $stmt->execute([$_POST['title'], $_POST['cat'], $img_name, $_POST['link'], $id]);
            echo json_encode(["success" => true]);
        }
        break;

    // **NEW: GET SINGLE VIDEO**
    case 'get-video':
        if (isset($_GET['id'])) {
            $stmt = $conn->prepare("SELECT * FROM movies WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $movie = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($movie) {
                echo json_encode($movie);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Video not found']);
            }
        }
        break;

    case 'del-cat':
    case 'del-post':
        if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['id'])) {
            $table = ($action == 'del-cat') ? 'categories' : 'movies';
            $stmt = $conn->prepare("DELETE FROM $table WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            echo json_encode(["success" => true]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Invalid action: $action"]);
        break;
}
?>
