export const updateProfile = async (req, res) => {
  try {
    const { username, bio, interests } = req.body;

    let profilePhotoUrl;
    if (req.file) {
      profilePhotoUrl = `/uploads/${req.file.filename}`;
    }

    const result = await pool.query(
      `UPDATE users
       SET username = COALESCE($1, username),
           bio = COALESCE($2, bio),
           interests = COALESCE($3, interests),
           profile_photo = COALESCE($4, profile_photo)
       WHERE id = $5
       RETURNING id, username, email, bio, interests, profile_photo, created_at`,
      [username, bio, interests, profilePhotoUrl, req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating profile" });
  }
};