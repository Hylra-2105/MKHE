import User from "../users/user.model.js";

// Alias to user model since auth doesn't have its own collection
// This resolves the architecture tech debt mentioned in AGENTS.md
export default User;
