<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $name = $_POST['name'] ?? '';
  $email = $_POST['email'] ?? '';
  $message = $_POST['message'] ?? '';
  // You can send an email or store the message here
  http_response_code(200);
  echo "OK";
} else {
  http_response_code(405);
}
?>