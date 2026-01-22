import structlog
import logging
import sys

def configure_logger():
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            
            # Formato de data legível (Ano-Mês-Dia Hora:Min:Seg)
            structlog.processors.TimeStamper(fmt="%Y-%m-%d %H:%M:%S", utc=False),
            
            # ConsoleRenderer dá as cores e o aspeto "limpo"
            structlog.dev.ConsoleRenderer(
                colors=True, 
                pad_event=20  # Alinha as mensagens
            )
        ],
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Redirecionar logs padrão do Uvicorn/FastAPI para o nosso formato
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO,
    )

logger = structlog.get_logger()