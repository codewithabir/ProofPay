import os
import uuid
import shutil
from abc import ABC, abstractmethod
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

class StorageProvider(ABC):
    @abstractmethod
    async def save_file(self, file: UploadFile, subfolder: str = "submissions") -> Tuple[str, str, int, str]:
        """Returns: (stored_file_path, original_filename, file_size, content_type)"""
        pass

    @abstractmethod
    def get_file_path(self, relative_path: str) -> str:
        pass


class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: str = settings.UPLOAD_DIR):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    async def save_file(self, file: UploadFile, subfolder: str = "submissions") -> Tuple[str, str, int, str]:
        if not file.filename:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No filename provided")

        ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File extension '.{ext}' is not permitted. Allowed: {settings.ALLOWED_EXTENSIONS}"
            )

        target_dir = os.path.join(self.base_dir, subfolder)
        os.makedirs(target_dir, exist_ok=True)

        unique_name = f"{uuid.uuid4().hex[:12]}_{file.filename.replace(' ', '_')}"
        file_path = os.path.join(target_dir, unique_name)

        content = await file.read()
        file_size = len(content)

        if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum size of {settings.MAX_FILE_SIZE_MB}MB"
            )

        with open(file_path, "wb") as buffer:
            buffer.write(content)

        # Determine category
        content_type = file.content_type or "application/octet-stream"
        category = "document"
        if ext in {"png", "jpg", "jpeg", "webp", "gif"}:
            category = "screenshot"
        elif ext in {"py", "js", "ts", "tsx", "jsx", "html", "css", "json", "sql"}:
            category = "code"

        return file_path, file.filename, file_size, category

    def get_file_path(self, relative_path: str) -> str:
        return os.path.abspath(relative_path)

storage_service = LocalStorageProvider()
