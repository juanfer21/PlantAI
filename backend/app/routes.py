from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User, Plant, Diagnosis, CareLog, CommunityPost, UsageLog
from app.services import identify_plant, diagnose_plant
import bcrypt

api = Blueprint("api", __name__)

FREE_DAILY_LIMIT = 2


# ── AUTH ──────────────────────────────────────────────────────

@api.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email", "").lower().strip()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not email or not username or not password:
        return jsonify({"error": "All fields are required"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 409

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = User(email=email, username=username, password_hash=password_hash)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity={"id": user.id, "plan": user.plan})
    return jsonify({"token": token, "user": user.serialize()}), 201


@api.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").lower().strip()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity={"id": user.id, "plan": user.plan})
    return jsonify({"token": token, "user": user.serialize()}), 200


@api.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    identity = get_jwt_identity()
    user = User.query.get(identity["id"])
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.serialize()}), 200


# ── PLANTS ────────────────────────────────────────────────────

@api.route("/plants", methods=["GET"])
@jwt_required()
def get_plants():
    identity = get_jwt_identity()
    plants = Plant.query.filter_by(user_id=identity["id"]) \
        .order_by(Plant.created_at.desc()).all()
    return jsonify({"plants": [p.serialize() for p in plants]}), 200


@api.route("/plants", methods=["POST"])
@jwt_required()
def add_plant():
    identity = get_jwt_identity()
    data = request.get_json()
    plant = Plant(
        user_id=identity["id"],
        name=data.get("name"),
        nickname=data.get("nickname"),
        species=data.get("species"),
        description=data.get("description"),
        photo_url=data.get("photo_url"),
        is_public=data.get("is_public", True),
    )
    db.session.add(plant)
    db.session.commit()
    return jsonify({"plant": plant.serialize()}), 201


@api.route("/plants/<int:plant_id>", methods=["GET"])
@jwt_required()
def get_plant(plant_id):
    identity = get_jwt_identity()
    plant = Plant.query.filter_by(id=plant_id, user_id=identity["id"]).first_or_404()
    return jsonify({"plant": plant.serialize()}), 200


@api.route("/plants/<int:plant_id>", methods=["PUT"])
@jwt_required()
def update_plant(plant_id):
    identity = get_jwt_identity()
    plant = Plant.query.filter_by(id=plant_id, user_id=identity["id"]).first_or_404()
    data = request.get_json()
    for field in ["name", "nickname", "species", "description", "photo_url", "is_public"]:
        if field in data:
            setattr(plant, field, data[field])
    db.session.commit()
    return jsonify({"plant": plant.serialize()}), 200


@api.route("/plants/<int:plant_id>", methods=["DELETE"])
@jwt_required()
def delete_plant(plant_id):
    identity = get_jwt_identity()
    plant = Plant.query.filter_by(id=plant_id, user_id=identity["id"]).first_or_404()
    db.session.delete(plant)
    db.session.commit()
    return jsonify({"message": "Plant deleted"}), 200


@api.route("/plants/<int:plant_id>/care", methods=["POST"])
@jwt_required()
def log_care(plant_id):
    identity = get_jwt_identity()
    Plant.query.filter_by(id=plant_id, user_id=identity["id"]).first_or_404()
    data = request.get_json()
    log = CareLog(
        plant_id=plant_id,
        action=data.get("action"),
        notes=data.get("notes"),
        photo_url=data.get("photo_url"),
    )
    db.session.add(log)
    db.session.commit()
    return jsonify({"log": log.serialize()}), 201


@api.route("/plants/<int:plant_id>/care", methods=["GET"])
@jwt_required()
def get_care_logs(plant_id):
    identity = get_jwt_identity()
    Plant.query.filter_by(id=plant_id, user_id=identity["id"]).first_or_404()
    logs = CareLog.query.filter_by(plant_id=plant_id) \
        .order_by(CareLog.created_at.desc()).all()
    return jsonify({"logs": [l.serialize() for l in logs]}), 200


# ── DOCTOR MODE ───────────────────────────────────────────────

@api.route("/doctor/remaining", methods=["GET"])
@jwt_required()
def remaining_scans():
    identity = get_jwt_identity()
    user = User.query.get(identity["id"])

    if user.plan == "pro":
        return jsonify({"remaining": None, "is_pro": True}), 200

    uses_today = UsageLog.count_today(identity["id"], "doctor")
    remaining = max(0, FREE_DAILY_LIMIT - uses_today)
    return jsonify({"remaining": remaining, "limit": FREE_DAILY_LIMIT, "is_pro": False}), 200


@api.route("/doctor/analyze", methods=["POST"])
@jwt_required()
def analyze():
    identity = get_jwt_identity()
    user = User.query.get(identity["id"])

    # Check daily limit for free users
    if user.plan == "free":
        uses_today = UsageLog.count_today(identity["id"], "doctor")
        if uses_today >= FREE_DAILY_LIMIT:
            return jsonify({
                "error": "limit_reached",
                "message": f"You have used your {FREE_DAILY_LIMIT} free diagnoses for today.",
                "upgrade": True
            }), 429

    data = request.get_json()
    image_b64 = data.get("image_base64")
    if not image_b64:
        return jsonify({"error": "Image is required"}), 400

    # Call AI service with error handling
    try:
        result = diagnose_plant(
            image_b64,
            data.get("plant_name", "plant"),
            data.get("location")
        )
    except RuntimeError as e:
        import traceback
        print("=" * 60)
        print("ERROR IN /doctor/analyze:")
        print(f"Error code: {e}")
        traceback.print_exc()
        print("=" * 60)
        error_code = str(e)

        if error_code == "AI_NO_CREDITS":
            return jsonify({
                "error": "ai_unavailable",
                "message": "AI service temporarily unavailable. Please try again later."
            }), 503

        if error_code == "AI_AUTH_FAILED":
            return jsonify({
                "error": "ai_config",
                "message": "AI service is not properly configured. Contact support."
            }), 503

        if error_code == "AI_RATE_LIMIT":
            return jsonify({
                "error": "ai_busy",
                "message": "AI service is busy. Please try again in a moment."
            }), 503

        if error_code == "AI_INVALID_RESPONSE":
            return jsonify({
                "error": "ai_response",
                "message": "Could not understand the AI response. Please try a clearer photo."
            }), 502

        return jsonify({
            "error": "ai_error",
            "message": "Could not analyze the photo. Please try again."
        }), 500

    # Always log usage for daily limit tracking
    db.session.add(UsageLog(user_id=identity["id"], action="doctor"))

    # Always save diagnosis (with or without plant_id)
    plant_id = data.get("plant_id")
    diagnosis = Diagnosis(
        plant_id=plant_id if plant_id else None,
        user_id=identity["id"],
        photo_url=data.get("photo_url"),
        status=result.get("status"),
        health_score=result.get("health_score"),
        common_name=result.get("common_name"),
        scientific_name=result.get("scientific_name"),
        watering_frequency=result.get("watering_frequency"),
        light_requirement=result.get("light_requirement"),
        issues_found=result.get("issues_found"),
        recommendations=result.get("recommendations"),
        care_tips=result.get("care_tips"),
        raw_ai_response=str(result)
    )
    db.session.add(diagnosis)

    # If linked to a plant, also update plant health and create care log
    if plant_id:
        plant = Plant.query.filter_by(id=plant_id, user_id=identity["id"]).first()
        if plant:
            plant.health_score = result.get("health_score", plant.health_score)
            care_log = CareLog(
                plant_id=plant.id,
                user_id=identity["id"],
                action="diagnosed",
                notes=f"Health: {result.get('health_score', 0)}% · Status: {result.get('status', 'unknown')}"
            )
            db.session.add(care_log)

    db.session.commit()

    # Calculate remaining uses for free users
    remaining_uses = None
    if user.plan == "free":
        remaining_uses = max(0, FREE_DAILY_LIMIT - UsageLog.count_today(identity["id"], "doctor"))

    return jsonify({
        "diagnosis": diagnosis.serialize(),
        "result": result,
        "remaining_uses": remaining_uses,
    }), 200


@api.route("/doctor/history/<int:plant_id>", methods=["GET"])
@jwt_required()
def diagnosis_history(plant_id):
    identity = get_jwt_identity()
    diagnoses = Diagnosis.query.filter_by(
        plant_id=plant_id,
        user_id=identity["id"]
    ).order_by(Diagnosis.created_at.desc()).all()
    return jsonify({"diagnoses": [d.serialize() for d in diagnoses]}), 200


# ── COMMUNITY ─────────────────────────────────────────────────

@api.route("/community/feed", methods=["GET"])
@jwt_required()
def feed():
    page = request.args.get("page", 1, type=int)
    posts = CommunityPost.query \
        .order_by(CommunityPost.created_at.desc()) \
        .paginate(page=page, per_page=20)
    return jsonify({
        "posts": [p.serialize() for p in posts.items],
        "total": posts.total,
        "pages": posts.pages,
        "page": page,
    }), 200


@api.route("/community/post", methods=["POST"])
@jwt_required()
def create_post():
    identity = get_jwt_identity()
    data = request.get_json()
    post = CommunityPost(
        user_id=identity["id"],
        plant_id=data.get("plant_id"),
        caption=data.get("caption"),
        photo_url=data.get("photo_url"),
    )
    db.session.add(post)
    db.session.commit()
    return jsonify({"post": post.serialize()}), 201


@api.route("/community/post/<int:post_id>/like", methods=["POST"])
@jwt_required()
def like_post(post_id):
    post = CommunityPost.query.get_or_404(post_id)
    post.likes_count += 1
    db.session.commit()
    return jsonify({"likes_count": post.likes_count}), 200


# ── USERS ─────────────────────────────────────────────────────

@api.route("/users/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    identity = get_jwt_identity()
    user = User.query.get(identity["id"])
    data = request.get_json()
    for field in ["username", "bio", "location", "avatar_url"]:
        if field in data:
            setattr(user, field, data[field])
    db.session.commit()
    return jsonify({"user": user.serialize()}), 200


@api.route("/users/<string:username>", methods=["GET"])
@jwt_required()
def public_profile(username):
    user = User.query.filter_by(username=username).first_or_404()
    public_plants = Plant.query.filter_by(user_id=user.id, is_public=True).all()
    return jsonify({
        "user": {
            "username": user.username,
            "avatar_url": user.avatar_url,
            "bio": user.bio,
            "location": user.location,
            "plant_count": len(public_plants),
            "created_at": user.created_at.isoformat(),
        },
        "plants": [p.serialize() for p in public_plants],
    }), 200



#-- pending --

    # Get pending (unassigned) diagnoses
@api.route("/doctor/pending", methods=["GET"])
@jwt_required()
def pending_diagnoses():
    identity = get_jwt_identity()
    diagnoses = Diagnosis.query.filter_by(
        user_id=identity["id"],
        plant_id=None
    ).order_by(Diagnosis.created_at.desc()).all()
    return jsonify({"diagnoses": [d.serialize() for d in diagnoses]}), 200


# Assign a pending diagnosis to an existing plant
@api.route("/doctor/diagnoses/<int:diagnosis_id>/assign", methods=["POST"])
@jwt_required()
def assign_diagnosis(diagnosis_id):
    identity = get_jwt_identity()
    data = request.get_json()
    plant_id = data.get("plant_id")

    if not plant_id:
        return jsonify({"error": "plant_id is required"}), 400

    diagnosis = Diagnosis.query.filter_by(
        id=diagnosis_id, user_id=identity["id"]
    ).first()
    if not diagnosis:
        return jsonify({"error": "Diagnosis not found"}), 404

    plant = Plant.query.filter_by(
        id=plant_id, user_id=identity["id"]
    ).first()
    if not plant:
        return jsonify({"error": "Plant not found"}), 404

    diagnosis.plant_id = plant_id
    plant.health_score = diagnosis.health_score or plant.health_score

    care_log = CareLog(
        plant_id=plant.id,
        user_id=identity["id"],
        action="diagnosed",
        notes=f"Health: {diagnosis.health_score or 0}% · Status: {diagnosis.status}",
        created_at=diagnosis.created_at
    )
    db.session.add(care_log)
    db.session.commit()

    return jsonify({
        "message": "Diagnosis assigned to plant",
        "diagnosis": diagnosis.serialize(),
        "plant": plant.serialize()
    }), 200


# Discard (delete) a pending diagnosis
@api.route("/doctor/diagnoses/<int:diagnosis_id>", methods=["DELETE"])
@jwt_required()
def delete_diagnosis(diagnosis_id):
    identity = get_jwt_identity()
    diagnosis = Diagnosis.query.filter_by(
        id=diagnosis_id, user_id=identity["id"]
    ).first()
    if not diagnosis:
        return jsonify({"error": "Diagnosis not found"}), 404

    db.session.delete(diagnosis)
    db.session.commit()
    return jsonify({"message": "Diagnosis discarded"}), 200