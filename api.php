
<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");

$host = "localhost";
$db = "u893493446_movie2";
$user = "u893493446_shahid2";
$pass = "Sj4143086*";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create tables if not exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        parent_id INT DEFAULT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE
    )");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS movies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category_id INT NOT NULL,
        img VARCHAR(500),
        link VARCHAR(500) NOT NULL,
        short_link VARCHAR(500)
    )");
    
} catch(PDOException $e) {
    die(json_encode(["error" => $e->getMessage()]));
}

$action = $_GET['action'] ?? '';

function makeSlug($text) {
    return strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $text), '-'));
}

switch($action) {
    
    case 'get-categories':
        $stmt = $pdo->query("SELECT * FROM categories ORDER BY parent_id, name");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    
    case 'add-category':
        $data = json_decode(file_get_contents("php://input"), true);
        $name = $data['name'];
        $parent = $data['parent_id'] ?? null;
        $slug = makeSlug($name);
        
        $stmt = $pdo->prepare("INSERT INTO categories (name, parent_id, slug) VALUES (?, ?, ?)");
        $stmt->execute([$name, $parent, $slug]);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId(), "slug" => $slug]);
        break;
    
    case 'update-category':
        $data = json_decode(file_get_contents("php://input"), true);
        $slug = makeSlug($data['name']);
        $stmt = $pdo->prepare("UPDATE categories SET name=?, slug=? WHERE id=?");
        $stmt->execute([$data['name'], $slug, $_GET['id']]);
        echo json_encode(["success" => true]);
        break;
    
    case 'delete-category':
        $pdo->prepare("DELETE FROM categories WHERE id=? OR parent_id=?")->execute([$_GET['id'], $_GET['id']]);
        echo json_encode(["success" => true]);
        break;
    
    case 'get-movies':
        $cat = $_GET['category_id'] ?? null;
        if ($cat) {
            $stmt = $pdo->prepare("SELECT m.*, c.name as cat_name, c.slug FROM movies m JOIN categories c ON m.category_id=c.id WHERE m.category_id=?");
            $stmt->execute([$cat]);
        } else {
            $stmt = $pdo->query("SELECT m.*, c.name as cat_name, c.slug FROM movies m JOIN categories c ON m.category_id=c.id ORDER BY m.id DESC");
        }
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    
    case 'get-movies-by-slug':
        $stmt = $pdo->prepare("SELECT m.*, c.name as cat_name FROM movies m JOIN categories c ON m.category_id=c.id WHERE c.slug=? ORDER BY m.id DESC");
        $stmt->execute([$_GET['slug']]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    
    case 'add-movie':
        $dir = 'uploads/';
        if (!file_exists($dir)) mkdir($dir, 0755, true);
        
        $img = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
            $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $img = $dir . time() . '_' . uniqid() . '.' . $ext;
            move_uploaded_file($_FILES['image']['tmp_name'], $img);
        }
        
        $stmt = $pdo->prepare("INSERT INTO movies (title, category_id, img, link, short_link) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$_POST['title'], $_POST['category_id'], $img, $_POST['link'], $_POST['short_link'] ?? '']);
        echo json_encode(["success" => true]);
        break;
    
    case 'update-movie':
        $img = $_POST['old_img'] ?? '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
            $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $img = 'uploads/' . time() . '_' . uniqid() . '.' . $ext;
            move_uploaded_file($_FILES['image']['tmp_name'], $img);
            if (!empty($_POST['old_img']) && file_exists($_POST['old_img'])) unlink($_POST['old_img']);
        }
        
        $stmt = $pdo->prepare("UPDATE movies SET title=?, category_id=?, img=?, link=?, short_link=? WHERE id=?");
        $stmt->execute([$_POST['title'], $_POST['category_id'], $img, $_POST['link'], $_POST['short_link'] ?? '', $_GET['id']]);
        echo json_encode(["success" => true]);
        break;
    
    case 'get-movie':
        $stmt = $pdo->prepare("SELECT * FROM movies WHERE id=?");
        $stmt->execute([$_GET['id']]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        break;
    
    case 'delete-movie':
        $stmt = $pdo->prepare("SELECT img FROM movies WHERE id=?");
        $stmt->execute([$_GET['id']]);
        $movie = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $pdo->prepare("DELETE FROM movies WHERE id=?")->execute([$_GET['id']]);
        
        if ($movie && !empty($movie['img']) && file_exists($movie['img'])) {
            unlink($movie['img']);
        }
        echo json_encode(["success" => true]);
        break;
    
    case 'get-category-by-slug':
        $stmt = $pdo->prepare("SELECT * FROM categories WHERE slug=?");
        $stmt->execute([$_GET['slug']]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        break;
    
    default:
        echo json_encode(["error" => "Invalid action"]);
}
?>
