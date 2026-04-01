package com.aisquare.controller;

import com.aisquare.common.result.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Value("${file.upload.path:./uploads/}")
    private String uploadPath;

    private Path getUploadDir() {
        Path path = Paths.get(uploadPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(path);
        } catch (IOException e) {
            throw new RuntimeException("无法创建上传目录: " + path, e);
        }
        return path;
    }

    @PostMapping("/image")
    public Result<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return Result.error("文件不能为空");
        }

        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }

        // 只允许图片
        String allowed = ".jpg,.jpeg,.png,.gif,.bmp,.webp,.svg";
        if (!allowed.contains(ext.toLowerCase())) {
            return Result.error("只支持图片格式：jpg, png, gif, bmp, webp, svg");
        }

        String fileName = UUID.randomUUID().toString().replace("-", "") + ext;
        Path uploadDir = getUploadDir().resolve("images");
        Files.createDirectories(uploadDir);
        Path filePath = uploadDir.resolve(fileName);
        file.transferTo(filePath.toFile());

        Map<String, String> data = new HashMap<>();
        data.put("url", "/uploads/images/" + fileName);
        data.put("fileName", originalName);
        return Result.success(data);
    }

    @PostMapping("/file")
    public Result<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return Result.error("文件不能为空");
        }

        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString().replace("-", "") + ext;
        Path uploadDir = getUploadDir().resolve("files");
        Files.createDirectories(uploadDir);
        Path filePath = uploadDir.resolve(fileName);
        file.transferTo(filePath.toFile());

        Map<String, String> data = new HashMap<>();
        data.put("url", "/uploads/files/" + fileName);
        data.put("fileName", originalName);
        return Result.success(data);
    }
}
