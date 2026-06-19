import { generateUsername } from "avatar-alias-gen";

const userService = {
  generateName: (style = "classic", includeNumber = true) =>
    generateUsername(style, includeNumber),
};

export default userService;
