# pdf_api_main.py - Рабочая версия для быстрого старта
import fastapi
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import shutil
import os
import uuid
import json
import logging
import time
import asyncio
from typing import List, Dict, Any
from datetime import datetime

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PDF Data Extraction API",
    description="API для извлечения структурированных данных из PDF документов",
    version="1.0.0"
)

# Настройка CORS
origins = [
    "http://localhost:3000",
    "http://localhost:9002",
    "https://your-nextjs-app.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Конфигурация
TEMP_UPLOAD_DIR = "temp_pdf_uploads"
TEMP_OUTPUT_DIR_BASE = "temp_pdf_outputs"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {".pdf"}

# Создание необходимых директорий
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)
os.makedirs(TEMP_OUTPUT_DIR_BASE, exist_ok=True)

# Заглушка для обработки PDF (пока не подключен реальный обработчик)
async def mock_process_pdf_async(pdf_path: str, output_folder: str) -> List[Dict[str, Any]]:
    """
    Временная заглушка для обработки PDF
    Возвращает тестовые данные для демонстрации работы API
    """
    await asyncio.sleep(2)  # Имитация обработки
    
    logger.info(f"Mock обработка PDF: {pdf_path}")
    
    # Возвращаем тестовые данные в ожидаемом формате
    return [
        {
            "id": "gen-1721161200000-0",
            "pos": "П1",
            "name": "ИТП",
            "type_original": "Кан.вент. IP54, FRC 60-30",
            "code": "",
            "manufacturer": "",
            "measure": "",
            "quantity": "1",
            "weight": "",
            "note": "",
            "article": "",
            "rag_text": "итп категория кан.вент. ip54 frc 60-30",
            "artikul": "",
            "category": "кан.вент.",
            "sub_category": "",
            "description": "ip54 frc 60-30",
            "material": "",
            "type_extracted": "",
            "connection_type": "",
            "size": "",
            "allies": "",
            "function": "",
            "Artikul_fact": "",
            "potential_artikuls": [],
            "manual_check_needed": True,
            "matching_thoughts": "Данные обработаны через API (тестовый режим)",
            "found_in_pdf_on_pages": [1]
        },
        {
            "id": "gen-1721161200000-1",
            "pos": "П2",
            "name": "Помещения охраны",
            "type_original": "Кан.вент. IP54, KVR 100/1",
            "code": "",
            "manufacturer": "",
            "measure": "",
            "quantity": "1",
            "weight": "",
            "note": "",
            "article": "",
            "rag_text": "помещения охраны категория кан.вент. ip54 kvr 100/1",
            "artikul": "100/1",
            "category": "кан.вент.",
            "sub_category": "",
            "description": "помещения охраны",
            "material": "",
            "type_extracted": "kvr",
            "connection_type": "",
            "size": "",
            "allies": "",
            "function": "",
            "Artikul_fact": "",
            "potential_artikuls": [],
            "manual_check_needed": True,
            "matching_thoughts": "Данные обработаны через API (тестовый режим)",
            "found_in_pdf_on_pages": [1]
        }
    ]

# Попытка импорта реальной функции обработки (опционально)
try:
    from Asinc_wirhout_Ocr_Norm import process_pdf_async
    logger.info("✅ Реальная функция обработки PDF импортирована успешно")
    USE_REAL_PROCESSING = True
except ImportError as e:
    logger.warning(f"⚠️ Не удалось импортировать реальную обработку PDF: {e}")
    logger.info("🔄 Используется mock-обработка для демонстрации")
    process_pdf_async = mock_process_pdf_async
    USE_REAL_PROCESSING = False

# Утилиты
def validate_file(file: UploadFile) -> None:
    """Валидация загружаемого файла"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Имя файла не указано")
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Неподдерживаемый формат файла. Разрешены: {', '.join(ALLOWED_EXTENSIONS)}"
        )

# API endpoints
@app.get("/api/health")
async def health_check():
    """Проверка здоровья API"""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "real_processing": USE_REAL_PROCESSING,
        "mode": "production" if USE_REAL_PROCESSING else "demo"
    }

@app.get("/api/config")
async def get_config():
    """Получение конфигурации API"""
    return {
        "real_processing_available": USE_REAL_PROCESSING,
        "max_file_size_mb": MAX_FILE_SIZE // (1024 * 1024),
        "supported_formats": list(ALLOWED_EXTENSIONS),
        "mode": "production" if USE_REAL_PROCESSING else "demo"
    }

@app.post("/api/process-pdf-sync/")
async def process_pdf_sync_endpoint(file: UploadFile = File(...)):
    """
    Синхронная обработка PDF файла
    """
    # Валидация файла
    validate_file(file)
    
    unique_id = str(uuid.uuid4())
    temp_pdf_path = os.path.join(TEMP_UPLOAD_DIR, f"{unique_id}_{file.filename}")
    temp_output_dir = os.path.join(TEMP_OUTPUT_DIR_BASE, unique_id)
    os.makedirs(temp_output_dir, exist_ok=True)

    logger.info(f"Получен файл для обработки: {file.filename} (режим: {'production' if USE_REAL_PROCESSING else 'demo'})")

    try:
        start_time = time.time()
        
        # Сохранение файла
        with open(temp_pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"Файл сохранен: {temp_pdf_path}")
        
        # Обработка (реальная или mock)
        extracted_data = await process_pdf_async(temp_pdf_path, temp_output_dir)
        
        processing_time = round(time.time() - start_time, 2)
        
        logger.info(f"Обработка завершена за {processing_time}s, извлечено {len(extracted_data)} записей")

        # Добавляем метаданные в заголовки ответа
        from fastapi.responses import JSONResponse
        response = JSONResponse(content=extracted_data)
        response.headers["X-Processing-Time"] = str(processing_time)
        response.headers["X-Items-Count"] = str(len(extracted_data))
        response.headers["X-Processing-Mode"] = "production" if USE_REAL_PROCESSING else "demo"
        
        return response

    except Exception as e:
        logger.error(f"Ошибка обработки файла {file.filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка обработки: {str(e)}")
    
    finally:
        # Очистка временных файлов
        try:
            if os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)
                logger.info(f"Временный файл удален: {temp_pdf_path}")
        except OSError as e:
            logger.warning(f"Не удалось удалить временный файл: {e}")
        
        try:
            if os.path.exists(temp_output_dir):
                shutil.rmtree(temp_output_dir)
                logger.info(f"Временная папка удалена: {temp_output_dir}")
        except OSError as e:
            logger.warning(f"Не удалось удалить временную папку: {e}")

# Совместимость с существующим эндпоинтом
@app.post("/api/process-pdf/")
async def process_pdf_endpoint(file: UploadFile = File(...)):
    """Алиас для совместимости"""
    return await process_pdf_sync_endpoint(file)

if __name__ == "__main__":
    logger.info("🚀 Запуск PDF Data Extraction API...")
    logger.info(f"📁 Рабочая директория: {os.getcwd()}")
    logger.info(f"🔧 Режим обработки: {'Production (реальная обработка PDF)' if USE_REAL_PROCESSING else 'Demo (тестовые данные)'}")
    
    if not USE_REAL_PROCESSING:
        logger.info("ℹ️  Для включения реальной обработки PDF:")
        logger.info("   1. Убедитесь что файл Asinc_wirhout_Ocr_Norm.py доступен")
        logger.info("   2. Настройте GEMINI_API_KEYS в этом файле")
        logger.info("   3. Перезапустите сервер")
    
    logger.info("🌐 Сервер будет доступен по адресу: http://localhost:8000")
    logger.info("📚 Документация API: http://localhost:8000/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")