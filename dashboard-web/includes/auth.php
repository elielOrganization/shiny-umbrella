<?php
session_start();
if (empty($_SESSION['uid'])) {
    header('Location: ../index.php');
    exit;
}
