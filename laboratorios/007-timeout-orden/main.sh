#!/usr/bin/env bash

set -u

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LAB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$LAB_DIR/007-timeout-orden.log"

cd "$PROJECT_ROOT" || exit 1

# ------------------------------------------------------------
# Utilidades
# ------------------------------------------------------------

timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

log() {
    echo "[$(timestamp)] $*" | tee -a "$LOG_FILE"
}

separator() {
    echo "" | tee -a "$LOG_FILE"
    echo "============================================================" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
}

# ------------------------------------------------------------
# Validaciones
# ------------------------------------------------------------

if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
    echo "ERROR: No se encontró package.json."
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "ERROR: npm no está instalado."
    exit 1
fi

mkdir -p "$LAB_DIR"

# ------------------------------------------------------------
# Inicializar log
# ------------------------------------------------------------

if [[ ! -f "$LOG_FILE" ]]; then
    {
        echo "LAB-007 — Timeout de orden"
        echo "Log de experimentación"
        echo "Proyecto: lab-flow-payment"
        echo "Inicio del log: $(timestamp)"
        echo ""
    } > "$LOG_FILE"
fi

# ------------------------------------------------------------
# Crear orden mediante LAB-001
# ------------------------------------------------------------

create_order() {

    local timeout="$1"

    separator

    log "CREACIÓN DE NUEVA ORDEN"
    log "Timeout solicitado: $timeout"

    echo ""
    echo "Ejecutando LAB-001..."
    echo ""

    if [[ "$timeout" == "none" ]]; then

        log "Ejecutando: CHECKOUT_TIMEOUT=none npm run lab:001"

        output="$(
            CHECKOUT_TIMEOUT=none npm run lab:001 2>&1
        )"

    else

        log "Ejecutando: CHECKOUT_TIMEOUT=${timeout} npm run lab:001"

        output="$(
            CHECKOUT_TIMEOUT="$timeout" npm run lab:001 2>&1
        )"

    fi

    exit_code=$?

    echo "$output"

    separator

    log "SALIDA COMPLETA DE LAB-001"

    echo "$output" | tee -a "$LOG_FILE"

    separator

    if [[ "$exit_code" -ne 0 ]]; then
        log "ERROR: LAB-001 terminó con código $exit_code."
        return 1
    fi

    # --------------------------------------------------------
    # Extraer datos del resultado real de LAB-001
    # --------------------------------------------------------

    COMMERCE_ORDER="$(
        echo "$output" |
        sed -n 's/^Orden: //p' |
        tail -n 1
    )"

    TOKEN="$(
        echo "$output" |
        sed -n "s/.*token: '\([^']*\)'.*/\1/p" |
        tail -n 1
    )"

    FLOW_ORDER="$(
        echo "$output" |
        sed -n "s/.*flowOrder: \([0-9]*\).*/\1/p" |
        tail -n 1
    )"

    CHECKOUT="$(
        echo "$output" |
        sed -n 's/^Checkout: //p' |
        tail -n 1
    )"

    # --------------------------------------------------------
    # Validaciones
    # --------------------------------------------------------

    if [[ -z "$COMMERCE_ORDER" ]]; then
        log "ERROR: No se pudo obtener commerceOrder."
        return 1
    fi

    if [[ -z "$TOKEN" ]]; then
        log "ERROR: No se pudo obtener token."
        return 1
    fi

    if [[ -z "$FLOW_ORDER" ]]; then
        log "ERROR: No se pudo obtener flowOrder."
        return 1
    fi

    if [[ -z "$CHECKOUT" ]]; then
        log "ERROR: No se pudo obtener URL de Checkout."
        return 1
    fi

    # --------------------------------------------------------
    # Registrar datos
    # --------------------------------------------------------

    log "Orden creada correctamente."
    log "commerceOrder: $COMMERCE_ORDER"
    log "flowOrder: $FLOW_ORDER"
    log "token: ${TOKEN:0:12}..."
    log "checkout: $CHECKOUT"

    return 0
}

# ------------------------------------------------------------
# Consultar estado mediante LAB-005
# ------------------------------------------------------------

get_status() {

    local token="$1"

    separator

    log "CONSULTA DE ESTADO"
    log "Ejecutando LAB-005."

    output="$(
        TOKEN="$token" npm run lab:005 2>&1
    )"

    exit_code=$?

    echo "$output"

    log "SALIDA COMPLETA DE LAB-005"

    echo "$output" | tee -a "$LOG_FILE"

    if [[ "$exit_code" -ne 0 ]]; then
        log "LAB-005 terminó con código $exit_code."
    fi

    # --------------------------------------------------------
    # Extraer status
    # --------------------------------------------------------

    STATUS="$(
        echo "$output" |
        sed -n "s/.*status: '\?\([0-9]*\)'\?.*/\1/p" |
        tail -n 1
    )"

    if [[ -z "$STATUS" ]]; then
        STATUS="$(
            echo "$output" |
            grep -Eo '"status"[[:space:]]*:[[:space:]]*[0-9]+' |
            tail -n 1 |
            grep -Eo '[0-9]+$'
        )"
    fi

    log "status detectado: ${STATUS:-NO DETECTADO}"

    return 0
}

# ------------------------------------------------------------
# Cronómetro
# ------------------------------------------------------------

countdown() {

    local seconds="$1"

    local start
    local current
    local elapsed
    local remaining

    start="$(date +%s)"

    log "Inicio del cronómetro."
    log "Duración objetivo: ${seconds} segundos."

    while true; do

        current="$(date +%s)"
        elapsed=$((current - start))

        if (( elapsed >= seconds )); then
            break
        fi

        remaining=$((seconds - elapsed))

        printf "\rTranscurrido: %3d s | Restante: %3d s" \
            "$elapsed" \
            "$remaining"

        sleep 1
    done

    printf "\rTranscurrido: %3d s | Restante:   0 s\n" \
        "$seconds"

    elapsed=$(( $(date +%s) - start ))

    log "Cronómetro finalizado."
    log "Tiempo real transcurrido: ${elapsed} segundos."
}

# ------------------------------------------------------------
# Ejecutar experimento
# ------------------------------------------------------------

run_experiment() {

    local timeout="$1"
    local wait_seconds="$2"

    separator

    log "LAB-007 — NUEVO EXPERIMENTO"
    log "Timeout de la orden: $timeout"
    log "Tiempo de espera: ${wait_seconds} segundos"
    log "Inicio: $(timestamp)"

    # --------------------------------------------------------
    # 1. Crear orden
    # --------------------------------------------------------

    if ! create_order "$timeout"; then
        log "EXPERIMENTO ABORTADO."
        return 1
    fi

    # --------------------------------------------------------
    # 2. Estado inicial
    # --------------------------------------------------------

    separator

    log "ESTADO INICIAL"

    get_status "$TOKEN"

    INITIAL_STATUS="${STATUS:-unknown}"

    log "Estado inicial registrado: $INITIAL_STATUS"

    # --------------------------------------------------------
    # 3. Checkout
    # --------------------------------------------------------

    separator

    log "CHECKOUT"
    log "URL: $CHECKOUT"

    echo ""
    echo "============================================================"
    echo " ABRE EL CHECKOUT"
    echo "============================================================"
    echo ""
    echo "$CHECKOUT"
    echo ""
    echo "NO selecciones ningún medio de pago."
    echo "NO completes la operación."
    echo "Deja el Checkout abierto."
    echo ""

    read -r -p \
        "Presiona ENTER cuando hayas abierto el Checkout..." \
        _

    log "Checkout abierto por el operador."
    log "Hora de apertura: $(timestamp)"

    # --------------------------------------------------------
    # 4. Esperar
    # --------------------------------------------------------

    separator

    log "ESPERANDO EXPIRACIÓN"

    countdown "$wait_seconds"

    # --------------------------------------------------------
    # 5. Estado final
    # --------------------------------------------------------

    separator

    log "ESTADO POST-TIMEOUT"

    get_status "$TOKEN"

    FINAL_STATUS="${STATUS:-unknown}"

    log "Estado final registrado: $FINAL_STATUS"

    # --------------------------------------------------------
    # 6. Resultado
    # --------------------------------------------------------

    separator

    log "RESULTADO DEL EXPERIMENTO"

    log "Timeout configurado: $timeout"
    log "Tiempo esperado: ${wait_seconds}s"
    log "Estado inicial: $INITIAL_STATUS"
    log "Estado final: $FINAL_STATUS"

    if [[ "$INITIAL_STATUS" == "1" && "$FINAL_STATUS" == "4" ]]; then

        log "RESULTADO: TRANSICIÓN 1 → 4 CONFIRMADA."

    elif [[ "$INITIAL_STATUS" == "$FINAL_STATUS" ]]; then

        log "RESULTADO: NO SE OBSERVÓ CAMBIO DE ESTADO."

    else

        log "RESULTADO: SE OBSERVÓ UNA TRANSICIÓN DIFERENTE."

    fi

    log "Fin: $(timestamp)"

    separator
}

# ------------------------------------------------------------
# Menú
# ------------------------------------------------------------

echo ""
echo "============================================================"
echo " LAB-007 — TIMEOUT DE ORDEN"
echo "============================================================"
echo ""
echo "La orden será creada utilizando:"
echo ""
echo "    npm run lab:001"
echo ""
echo "Luego se consultará utilizando:"
echo ""
echo "    npm run lab:005"
echo ""
echo "El resultado será almacenado en:"
echo ""
echo "    $LOG_FILE"
echo ""
echo "============================================================"
echo ""

echo "Seleccione la prueba:"
echo ""
echo "  1) checkout_timeout = 50 segundos"
echo "  2) checkout_timeout = 30 segundos"
echo "  3) checkout_timeout = 10 segundos"
echo "  4) Sin checkout_timeout"
echo "  5) Otro valor"
echo ""

read -r -p "Opción: " OPTION

case "$OPTION" in

    1)
        TIMEOUT=50
        WAIT_SECONDS=50
        ;;

    2)
        TIMEOUT=30
        WAIT_SECONDS=30
        ;;

    3)
        TIMEOUT=10
        WAIT_SECONDS=10
        ;;

    4)

        TIMEOUT=none

        echo ""
        echo "La orden NO tendrá checkout_timeout."
        echo ""

        read -r -p \
            "¿Cuántos segundos deseas esperar antes de consultar?: " \
            WAIT_SECONDS

        if ! [[ "$WAIT_SECONDS" =~ ^[0-9]+$ ]]; then
            echo "ERROR: Debes introducir un número entero."
            exit 1
        fi

        ;;

    5)

        read -r -p \
            "¿Cuántos segundos deseas establecer como timeout?: " \
            TIMEOUT

        if ! [[ "$TIMEOUT" =~ ^[0-9]+$ ]]; then
            echo "ERROR: Debes introducir un número entero."
            exit 1
        fi

        WAIT_SECONDS="$TIMEOUT"

        ;;

    *)

        echo "ERROR: Opción inválida."
        exit 1

        ;;

esac

run_experiment "$TIMEOUT" "$WAIT_SECONDS"

echo ""
echo "============================================================"
echo " LAB-007 FINALIZADO"
echo "============================================================"
echo ""
echo "Log:"
echo "$LOG_FILE"
echo ""
