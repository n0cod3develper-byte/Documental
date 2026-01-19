#!/bin/bash

# ============================================
# Script de Backup Automatizado
# Sistema de Gestión Documental
# ============================================

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="documental_db"
DB_NAME="documental_db"
DB_USER="documental_user"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Backup Sistema Documental${NC}"
echo -e "${GREEN}  Fecha: $(date)${NC}"
echo -e "${GREEN}========================================${NC}"

# Crear directorio de backup
mkdir -p $BACKUP_DIR/$DATE

# 1. Backup de Base de Datos
echo -e "\n${YELLOW}[1/3] Respaldando base de datos...${NC}"
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/$DATE/db_backup.sql.gz

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Base de datos respaldada${NC}"
else
    echo -e "${RED}✗ Error al respaldar base de datos${NC}"
    exit 1
fi

# 2. Backup de Archivos
echo -e "\n${YELLOW}[2/3] Respaldando archivos subidos...${NC}"
docker run --rm -v documental_uploads:/uploads -v $BACKUP_DIR/$DATE:/backup alpine tar czf /backup/uploads_backup.tar.gz -C /uploads .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Archivos respaldados${NC}"
else
    echo -e "${RED}✗ Error al respaldar archivos${NC}"
    exit 1
fi

# 3. Backup de Logs
echo -e "\n${YELLOW}[3/3] Respaldando logs...${NC}"
docker run --rm -v documental_logs:/logs -v $BACKUP_DIR/$DATE:/backup alpine tar czf /backup/logs_backup.tar.gz -C /logs .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Logs respaldados${NC}"
else
    echo -e "${RED}✗ Error al respaldar logs${NC}"
    exit 1
fi

# Calcular tamaños
DB_SIZE=$(du -h $BACKUP_DIR/$DATE/db_backup.sql.gz | cut -f1)
UPLOADS_SIZE=$(du -h $BACKUP_DIR/$DATE/uploads_backup.tar.gz | cut -f1)
LOGS_SIZE=$(du -h $BACKUP_DIR/$DATE/logs_backup.tar.gz | cut -f1)

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Backup Completado${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Ubicación: ${YELLOW}$BACKUP_DIR/$DATE${NC}"
echo -e "Base de datos: ${YELLOW}$DB_SIZE${NC}"
echo -e "Archivos: ${YELLOW}$UPLOADS_SIZE${NC}"
echo -e "Logs: ${YELLOW}$LOGS_SIZE${NC}"

# 4. Limpiar backups antiguos (>30 días)
echo -e "\n${YELLOW}Limpiando backups antiguos (>30 días)...${NC}"
find $BACKUP_DIR -type d -mtime +30 -exec rm -rf {} \; 2>/dev/null
echo -e "${GREEN}✓ Limpieza completada${NC}"

echo -e "\n${GREEN}Backup finalizado exitosamente!${NC}\n"
